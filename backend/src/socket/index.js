import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { socketAuthMiddleware } from '../middlewares/socketMiddleware.js';
import { getUserConversationsForSocketIO } from '../controllers/conversationController.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map();
const hiddenUsers = new Set();

const emitVisibleOnlineUsers = () => {
    const visibleOnlineUsers = Array.from(onlineUsers.keys())
        .filter((id) => !hiddenUsers.has(id));
    io.emit("online-users", visibleOnlineUsers);
};

io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();
    console.log(`${user.displayName} connected with socket ID: ${socket.id}`);

    onlineUsers.set(userId, socket.id);

    if (user.showOnlineStatus === false) {
        hiddenUsers.add(userId);
    } else {
        hiddenUsers.delete(userId);
    }

    const visibleOnlineUsers = Array.from(onlineUsers.keys())
        .filter((id) => !hiddenUsers.has(id));
    io.emit("online-users", visibleOnlineUsers);

    const conversationIds = await getUserConversationsForSocketIO(user._id);
    conversationIds.forEach((id) => socket.join(id));

    socket.on("join-conversation", (conversationId) => {
        socket.join(conversationId);
    });

    socket.join(userId);

    socket.on("update-online-status", (showOnlineStatus) => {
        if (showOnlineStatus) {
            hiddenUsers.delete(userId);
        } else {
            hiddenUsers.add(userId);
        }
        emitVisibleOnlineUsers();
    });
    
    socket.on("typing-start", ({ conversationId }) => {
        socket.to(conversationId).emit("typing-start", {
            conversationId,
            userId: user._id.toString(),
            displayName: user.displayName
        });
    });

    socket.on("typing-stop", ({ conversationId }) => {
        socket.to(conversationId).emit("typing-stop", {
            conversationId,
            userId: user._id.toString()
        });
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        hiddenUsers.delete(userId);

        const visibleOnlineUsers = Array.from(onlineUsers.keys())
            .filter((id) => !hiddenUsers.has(id));
        io.emit("online-users", visibleOnlineUsers);
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

export { io, app, server };
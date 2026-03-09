import {create} from 'zustand';
import { io, type Socket} from 'socket.io-client';
import {useAuthStore} from './useAuthStore';
import type { SocketState } from '@/types/store';
import { useChatStore } from './useChatStore';

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket) return;

        const socket: Socket = io(baseURL, {
            auth: {token: accessToken},
            transports: ['websocket'],
        });

        set({socket});

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        // Online users update
        socket.on('online-users', (userIds) => {
            set({onlineUsers: userIds});
        });

        // New message received
        socket.on('new-message', ({message, conversation, unreadCounts}) => {
            useChatStore .getState().addMessage(message);

            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: [],
                    avatarUrl: null
                }
            };

            const updateConversation = {
                ...conversation,
                lastMessage,
                unreadCounts
            }

            if(useChatStore.getState().activeConversationId !== conversation._id) {
                // Mark as read
            }

            useChatStore.getState().updateConversation(updateConversation);
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;

        if (socket) {
            socket.disconnect();
            set({socket: null});
            console.log('Disconnected from socket server');
        }
    }
}))
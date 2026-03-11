import type { User } from './user';
import type { Conversation, Message } from './chat';
import type { Socket } from 'node_modules/socket.io-client/build/esm/socket';

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    setAccessToken: (accessToken: string) => void;
    clearState: () => void;

    signUp: (username: string, password: string, firstname: string, lastname: string, email: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<void>;
}

export interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, {
        items: Message[],
        hasMore: boolean,
        nextCursor?: string | null
    }>;
    activeConversationId: string | null;
    convloading: boolean;
    messageLoading: boolean;
    reset: () => void;

    setActiveConversation: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId?: string) => Promise<void>;
    sendDirectMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>;
    sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
    // Add Message
    addMessage: (message: Message) => Promise<void>;

    // Update Conversation
    updateConversation: (conversation: any) => void;
    markAsSeen: () => Promise<void>;
}

export interface SocketState {
    socket: Socket | null;
    onlineUsers: string[];
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export interface FriendState {
    loading: boolean;
    searchbyUsername: (username: string) => Promise<User | null>;
    addFriend: (to: string, message?: string) => Promise<string>;
}
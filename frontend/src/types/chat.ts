export interface Participant {
  _id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface Conversation {
  id: string;
  _id: string;
  type: "direct" | "group";
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Reaction {
    userId: string;
    emoji: string;
}

export interface ReplyTo {
    _id: string;
    content?: string | null;
    imgUrl?: string | null;
    senderId: {
        _id: string;
        displayName: string;
    } | string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    imgUrl?: string | null;
    reactions?: Reaction[];
    updatedAt?: string | null;
    createdAt: string;
    isOwn?: boolean;
    replyTo?: ReplyTo | null;
    deletedForEveryone?: boolean;
}

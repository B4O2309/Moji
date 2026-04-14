import { useChatStore } from "@/stores/useChatStore.ts";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { cn } from "@/lib/utils";

interface ChatWindowBodyProps {
    searchResults?: string[];
    searchIndex?: number;
    searchQuery?: string;
}

const ChatWindowBody = ({ searchResults = [], searchIndex = 0, searchQuery = "" }: ChatWindowBodyProps) => {
    const { activeConversationId, conversations, messages: allMessages, fetchMessages } = useChatStore();
    const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">("delivered");
    const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(null);

    const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
    const messages = allMessages[activeConversationId!]?.items ?? [];
    const reverseMessages = [...messages].reverse();
    const selectedConv = conversations.find((c) => c._id === activeConversationId);
    const key = "chat-scroll-" + activeConversationId;

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement>>({});
    const pendingScrollId = useRef<string | null>(null);

    useEffect(() => {
        const lastMessage = selectedConv?.lastMessage;
        if (!lastMessage) return;
        const seenBy = selectedConv?.seenBy ?? [];
        setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
    }, [selectedConv]);

    useLayoutEffect(() => {
        if (searchResults.length > 0) return;
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [activeConversationId]);

    useLayoutEffect(() => {
        if (searchResults.length > 0) return;
        const container = containerRef.current;
        if (!container) return;
        const item = sessionStorage.getItem(key);
        if (item) {
            const { scrollTop } = JSON.parse(item);
            requestAnimationFrame(() => { container.scrollTop = scrollTop; });
        }
    }, [messages.length]);

    useEffect(() => {
        if (searchResults.length === 0) return;
        const targetId = searchResults[searchIndex];
        if (!targetId) return;
        const el = messageRefs.current[targetId];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [searchResults, searchIndex]);

    // Sau mỗi lần messages thay đổi: kiểm tra nếu tin nhắn đang chờ đã được load
    useEffect(() => {
        const targetId = pendingScrollId.current;
        if (!targetId) return;
        const el = messageRefs.current[targetId];
        if (el) {
            pendingScrollId.current = null;
            scrollAndHighlight(targetId);
        }
    }, [messages.length]);

    const scrollAndHighlight = useCallback((messageId: string) => {
        const el = messageRefs.current[messageId];
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedReplyId(messageId);
        setTimeout(() => setHighlightedReplyId(null), 1500);
    }, []);

    const handleScrollToReply = useCallback(async (replyMessageId: string) => {
        // Tin nhắn đã có trong DOM -> scroll thẳng
        if (messageRefs.current[replyMessageId]) {
            scrollAndHighlight(replyMessageId);
            return;
        }

        // Chưa load -> fetch lịch sử cho đến khi tìm thấy
        pendingScrollId.current = replyMessageId;
        const convId = activeConversationId;
        if (!convId) return;

        for (let i = 0; i < 10; i++) {
            const state = useChatStore.getState();
            const currentHasMore = state.messages[convId]?.hasMore ?? false;
            if (!currentHasMore) break;

            await fetchMessages(convId);

            const items = useChatStore.getState().messages[convId]?.items ?? [];
            if (items.some(m => m._id === replyMessageId)) break;
        }
    }, [activeConversationId, fetchMessages, scrollAndHighlight]);

    const fetchMoreMessages = async () => {
        if (!activeConversationId) return;
        try { await fetchMessages(activeConversationId); }
        catch (error) { console.error("Failed to fetch more messages", error); }
    };

    const handleScrollSave = () => {
        const container = containerRef.current;
        if (!container || !activeConversationId) return;
        sessionStorage.setItem(key, JSON.stringify({
            scrollTop: container.scrollTop,
            scrollHeight: container.scrollHeight
        }));
    };

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const item = sessionStorage.getItem(key);
        if (item) {
            const { scrollTop } = JSON.parse(item);
            requestAnimationFrame(() => { container.scrollTop = scrollTop; });
        }
    }, [messages.length]);

    if (!selectedConv) return <ChatWelcomeScreen />;

    if (!messages.length) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div
                onScroll={handleScrollSave}
                ref={containerRef}
                id="scrollableDiv"
                className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
            >
                <div ref={messagesEndRef} />
                <InfiniteScroll
                    dataLength={messages.length}
                    next={fetchMoreMessages}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv"
                    loader={<p>Loading...</p>}
                    inverse={true}
                    style={{ display: 'flex', flexDirection: 'column-reverse', overflow: "visible" }}
                >
                    {reverseMessages.map((message, index) => {
                        const isHighlighted = searchResults.includes(message._id);
                        const isActive = searchResults[searchIndex] === message._id;
                        const isReplyHighlighted = highlightedReplyId === message._id;

                        return (
                            <div
                                key={message._id ?? index}
                                ref={el => { if (el) messageRefs.current[message._id] = el; }}
                                className={cn(
                                    "rounded-lg transition-all duration-300",
                                    isActive && "bg-primary/10 ring-1 ring-primary/30",
                                    isHighlighted && !isActive && "bg-muted/50",
                                    isReplyHighlighted && "bg-primary/15 ring-2 ring-primary/40"
                                )}
                            >
                                <MessageItem
                                    message={message}
                                    index={index}
                                    messages={reverseMessages}
                                    selectedConv={selectedConv}
                                    lastMessageStatus={lastMessageStatus}
                                    searchQuery={searchQuery}
                                    onScrollToReply={handleScrollToReply}
                                />
                            </div>
                        );
                    })}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default ChatWindowBody;
import { useChatStore } from "@/stores/useChatStore.ts";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const ChatWindowBody = () => {
    const {activeConversationId, conversations, messages: allMessages, fetchMessages} = useChatStore();
    const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">("delivered"); 
    const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
    const messages = allMessages[activeConversationId!]?.items ?? [];
    const reverseMessages = [...messages].reverse();
    const selectedConv = conversations.find((c) => c._id === activeConversationId);
    const key = "chat-scroll-" + activeConversationId;

    // Refresh last message status when conversation changes
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lastMessage = selectedConv?.lastMessage;
        if (!lastMessage) return;

        const seenBy = selectedConv?.seenBy ?? [];

        setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
    }, [selectedConv]);

    // Scroll to bottom when messages change
    useLayoutEffect(() => {
        if(!messagesEndRef.current) return;

        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [activeConversationId]);

    const fetchMoreMessages = async () => {
        if(!activeConversationId) return;

        try {
            await fetchMessages(activeConversationId);
        }
        catch (error) {
            console.error("Failed to fetch more messages", error);
        }
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
            const {scrollTop} = JSON.parse(item);
            requestAnimationFrame(() => {
                container.scrollTop = scrollTop;
            });
        }
    }, [messages.length]);   

    if(!selectedConv) {
        return <ChatWelcomeScreen/>;
    }

    if(!messages.length) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet. Start the conversation!
            </div>
        );
    }
    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div onScroll={handleScrollSave} ref={containerRef} id="scrollableDiv" className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar">
                <div ref={messagesEndRef}></div>
                <InfiniteScroll
                    dataLength={messages.length}
                    next={fetchMoreMessages}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv"
                    loader={<p>Loading...</p>}
                    inverse={true}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column-reverse', 
                        overflow: "visible" 
                    }}
                >
                    {reverseMessages.map((message, index) => (
                        <MessageItem
                            key={message._id ?? index}
                            message={message}
                            index={index}
                            messages={reverseMessages}
                            selectedConv={selectedConv}
                            lastMessageStatus= {lastMessageStatus}
                        />
                    ))}
                </InfiniteScroll>

            </div>
        </div>
    );
}

export default ChatWindowBody;
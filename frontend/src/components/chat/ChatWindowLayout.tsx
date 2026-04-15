import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeSreen from "./ChatWelcomeScreen";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { SidebarInset } from "../ui/sidebar";
import { useEffect, useState } from "react";

const ChatWindowLayout = () => {
    const { activeConversationId, conversations, messageLoading: loading, markAsSeen } = useChatStore();

    const selectedConv = conversations.find((c) => c._id === activeConversationId) ?? null;

    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setSearchResults([]);
        setSearchIndex(0);
    }, [activeConversationId]);

    useEffect(() => {
        if (!activeConversationId) return;
        useChatStore.getState().markAsSeen();
    }, [activeConversationId]);

    if (!selectedConv) {
        return <ChatWelcomeSreen />;
    }

    if (loading) {
        return <ChatWindowSkeleton />;
    }

    return (
        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
            {/* Header */}
            <ChatWindowHeader
                chat={selectedConv}
                onSearchResults={setSearchResults}
                onSearchIndex={setSearchIndex}
                searchResults={searchResults}
                searchIndex={searchIndex}
                onSearchQuery={setSearchQuery}
            />
            {/* Body */}
            <div className="flex-1 overflow-y-auto
            bg-primary-foreground">
                <ChatWindowBody
                    searchResults={searchResults}
                    searchIndex={searchIndex}
                    searchQuery={searchQuery}
                />

            </div>
            {/* Footer */}
            <MessageInput selectedConv={selectedConv} />

        </SidebarInset>
    );
}

export default ChatWindowLayout;
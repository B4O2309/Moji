import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeSreen from "./ChatWelcomeScreen";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { SidebarInset } from "../ui/sidebar";
import { useEffect } from "react";

const ChatWindowLayout = () => {
    const {activeConversationId, conversations, messageLoading: loading, markAsSeen} = useChatStore();
    
    const selectedConv = conversations.find((c) => c._id === activeConversationId) ?? null;

    useEffect(() => {
        if (!selectedConv) return;

        const markSeen = async () => {
            try {
                await markAsSeen();
            }
            catch (error) {
                console.error("Error marking messages as seen:", error);
            }
        }
        markSeen();
    }, [markAsSeen, selectedConv]);

    if (!selectedConv) {
        return <ChatWelcomeSreen/>;
    }

    if(loading) {
        return <ChatWindowSkeleton/>;
    }

    return (
        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
            {/* Header */}
            <ChatWindowHeader chat={selectedConv}/>
            {/* Body */}
            <div className="flex-1 overflow-y-auto
            bg-primary-foreground">
                <ChatWindowBody/>

            </div>
            {/* Footer */}
            <MessageInput selectedConv={selectedConv}/>

        </SidebarInset>
    );
}

export default ChatWindowLayout;
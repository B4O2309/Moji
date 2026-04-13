import { useChatStore } from "@/stores/useChatStore";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import type { Conversation } from "@/types/chat";
import { useSocketStore } from "@/stores/useSocketStore";
import { Info, Users, UserPlus, Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import UserProfileDialog from "../profile/UserProfileDialog";
import GroupMembersDialog from "../profile/GroupMembersDialog";
import AddGroupMembersDialog from "../profile/AddGroupMembersDialog";
import { Input } from "../ui/input";

interface ChatWindowHeaderProps {
    chat?: Conversation;
    onSearchResults?: (results: string[]) => void;
    onSearchIndex?: (index: number) => void;
    onSearchQuery?: (query: string) => void;
    searchResults?: string[];
    searchIndex?: number;
}

const ChatWindowHeader = ({
    chat,
    onSearchResults,
    onSearchIndex,
    onSearchQuery,
    searchResults = [],
    searchIndex = 0
}: ChatWindowHeaderProps) => {
    const { conversations, activeConversationId, messages: allMessages } = useChatStore();
    const { user } = useAuthStore();
    const { onlineUsers } = useSocketStore();
    const [viewingUserId, setViewingUserId] = useState<string | null>(null);
    const [openMembers, setOpenMembers] = useState(false);
    const [openAddMembers, setOpenAddMembers] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    chat = chat ?? conversations.find((c) => c._id === activeConversationId);
    let otherUser;

    if (!chat)
        return (
            <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
                <SidebarTrigger className="-ml-1 text-foreground" />
            </header>
        );

    if (chat.type === "direct") {
        const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
        otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
        if (!user || !otherUser) return;
    }

    // Search messages in the current conversation
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        onSearchQuery?.(query);

        if (!query.trim() || !activeConversationId) {
            onSearchResults?.([]);
            return;
        }

        const messages = allMessages[activeConversationId]?.items ?? [];
        const matched = messages
            .filter(m => m.content?.toLowerCase().includes(query.toLowerCase()))
            .map(m => m._id);

        onSearchResults?.(matched);
        onSearchIndex?.(0);
    }, [activeConversationId, allMessages, onSearchResults, onSearchIndex]);

    const handleCloseSearch = () => {
        setShowSearch(false);
        setSearchQuery("");
        onSearchResults?.([]);
        onSearchQuery?.("");
    };

    const handlePrev = () => {
        if (searchResults.length === 0) return;
        const newIndex = (searchIndex - 1) % searchResults.length;
        onSearchIndex?.(newIndex);
    };

    const handleNext = () => {
        if (searchResults.length === 0) return;
        const newIndex = (searchIndex + 1 + searchResults.length) % searchResults.length;
        onSearchIndex?.(newIndex);
    };

    return (
        <>
            <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background border-b border-border/20">
                <div className="flex items-center gap-2 w-full">
                    <SidebarTrigger className="-ml-1 text-foreground" />
                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

                    {showSearch ? (
                        // Search mode
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                autoFocus
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Search messages..."
                                className="h-8 text-sm"
                                onKeyDown={e => {
                                    if (e.key === "Enter") handleNext();
                                    if (e.key === "Escape") handleCloseSearch();
                                }}
                            />

                            {/* Result count */}
                            {searchQuery && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {searchResults.length > 0
                                        ? `${searchIndex + 1} / ${searchResults.length}`
                                        : "No results"
                                    }
                                </span>
                            )}

                            {/* Navigate buttons */}
                            {searchResults.length > 1 && (
                                <div className="flex gap-0.5">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="p-1 rounded hover:bg-muted transition text-muted-foreground"
                                        title="Previous"
                                    >
                                        <ChevronUp className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="p-1 rounded hover:bg-muted transition text-muted-foreground"
                                        title="Next"
                                    >
                                        <ChevronDown className="size-4" />
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleCloseSearch}
                                className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        // Normal mode
                        <div className="p-2 w-full flex items-center gap-3">
                            <div className="relative">
                                {chat.type === "direct" ? (
                                    <>
                                        <UserAvatar
                                            type="sidebar"
                                            name={otherUser?.displayName || "Verdi User"}
                                            avatarUrl={otherUser?.avatarUrl || undefined}
                                        />
                                        <StatusBadge status={onlineUsers.includes(otherUser?._id ?? "") ? "online" : "offline"} />
                                    </>
                                ) : (
                                    <GroupChatAvatar participants={chat.participants} type="sidebar" />
                                )}
                            </div>

                            <h2 className="font-semibold text-foreground flex-1">
                                {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
                            </h2>

                            {/* Search button */}
                            <button
                                type="button"
                                onClick={() => setShowSearch(true)}
                                className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                title="Search messages"
                            >
                                <Search className="h-4 w-4" />
                            </button>

                            {chat.type === "direct" && otherUser && (
                                <button
                                    type="button"
                                    onClick={() => setViewingUserId(otherUser!._id)}
                                    className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                    title="View profile"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            )}

                            {chat.type === "group" && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setOpenAddMembers(true)}
                                        className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                        title="Add members"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOpenMembers(true)}
                                        className="p-1.5 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                                        title="View members"
                                    >
                                        <Users className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <UserProfileDialog userId={viewingUserId} onClose={() => setViewingUserId(null)} />

            {chat.type === "group" && (
                <>
                    <GroupMembersDialog
                        open={openMembers}
                        onClose={() => setOpenMembers(false)}
                        members={chat.participants}
                        groupName={chat.group?.name ?? "Group"}
                        conversationId={chat._id}
                    />
                    <AddGroupMembersDialog
                        open={openAddMembers}
                        onClose={() => setOpenAddMembers(false)}
                        conversationId={chat._id}
                        currentMembers={chat.participants}
                    />
                </>
            )}
        </>
    );
};

export default ChatWindowHeader;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { useSocketStore } from "@/stores/useSocketStore"
import { useChatStore } from "@/stores/useChatStore"
import type { Conversation } from "@/types/chat"
import UserAvatar from "./UserAvatar"
import GroupChatAvatar from "./GroupChatAvatar"
import StatusBadge from "./StatusBadge"
import { Archive, ArchiveX } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { formatOnlineTime } from "@/lib/utils"
import api from "@/lib/axios"

interface ArchivedConversationsDialogProps {
    open: boolean;
    onClose: () => void;
}

const ArchivedConversationsDialog = ({ open, onClose }: ArchivedConversationsDialogProps) => {
    const { user } = useAuthStore();
    const { onlineUsers } = useSocketStore();
    const { fetchConversations, setActiveConversation, fetchMessages } = useChatStore();
    const [archived, setArchived] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [unarchiving, setUnarchiving] = useState<string | null>(null);

    const fetchArchived = async () => {
        try {
            setLoading(true);
            const res = await api.get('/conversations/archived', { withCredentials: true });
            setArchived(res.data.conversations);
        } catch {
            toast.error("Failed to load archived conversations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchArchived();
    }, [open]);

    const handleUnarchive = async (conversationId: string) => {
        try {
            setUnarchiving(conversationId);
            await api.patch(`/conversations/${conversationId}/unarchive`, {}, { withCredentials: true });
            setArchived(prev => prev.filter(c => c._id !== conversationId));
            await fetchConversations();
            toast.success("Conversation unarchived.");
        } catch {
            toast.error("Failed to unarchive.");
        } finally {
            setUnarchiving(null);
        }
    };

    const handleOpen = async (conv: Conversation) => {
        await handleUnarchive(conv._id);
        setActiveConversation(conv._id);
        await fetchMessages(conv._id);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-primary" />
                        Archived ({archived.length})
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : archived.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <Archive className="size-8 opacity-30" />
                        <p className="text-sm">No archived conversations.</p>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 beautiful-scrollbar">
                        {archived.map((conv) => {
                            const otherUser = conv.type === "direct"
                                ? conv.participants.find(p => p._id !== user?._id)
                                : null;
                            const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;
                            const name = conv.type === "direct"
                                ? otherUser?.displayName ?? "Unknown"
                                : conv.group?.name ?? "Group";
                            const lastMsg = conv.lastMessage?.content ?? "";

                            return (
                                <div
                                    key={conv._id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition group cursor-pointer"
                                    onClick={() => handleOpen(conv)}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        {conv.type === "direct" ? (
                                            <>
                                                <UserAvatar
                                                    type="sidebar"
                                                    name={otherUser?.displayName ?? ""}
                                                    avatarUrl={otherUser?.avatarUrl ?? undefined}
                                                />
                                                <StatusBadge status={isOnline ? "online" : "offline"} />
                                            </>
                                        ) : (
                                            <GroupChatAvatar participants={conv.participants} type="sidebar" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {lastMsg || "No messages yet"}
                                        </p>
                                    </div>

                                    {/* Time + Unarchive button */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {conv.lastMessage?.createdAt && (
                                            <span className="text-xs text-muted-foreground">
                                                {formatOnlineTime(new Date(conv.lastMessage.createdAt))}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnarchive(conv._id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-primary/10 text-primary"
                                            title="Unarchive"
                                            disabled={unarchiving === conv._id}
                                        >
                                            <ArchiveX className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ArchivedConversationsDialog;
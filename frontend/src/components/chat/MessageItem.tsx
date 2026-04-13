import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { cn, formatMessageTime } from "@/lib/utils";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { Smile, Reply, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { useChatStore } from "@/stores/useChatStore";
import { Button } from "../ui/button";

const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

interface MessageItemProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConv: Conversation;
    lastMessageStatus: "delivered" | "seen";
    searchQuery?: string;
}

// Highlights matched search query text inside a message
const HighlightText = ({ text, query }: { text: string; query?: string }) => {
    if (!query?.trim()) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                        key={i}
                        style={{ backgroundColor: '#FDE047', color: '#000', borderRadius: '2px', padding: '0 2px' }}
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

const MessageItem = ({ message, index, messages, selectedConv, lastMessageStatus, searchQuery }: MessageItemProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { user } = useAuthStore();
    const { setReplyingTo, deleteMessageLocally } = useChatStore();
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
    const isShowTime = index === 0 ||
        new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime() > 300000;
    const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

    const participant = selectedConv.participants.find(
        (p: Participant) => p._id.toString() === message.senderId.toString()
    );

    // Group reactions by emoji for display
    const reactionGroups = (message.reactions ?? []).reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r.userId);
        return acc;
    }, {} as Record<string, string[]>);

    // Calculate absolute position for the emoji picker portal
    const calculatePickerPosition = () => {
        if (!btnRef.current) return;
        const btnRect = btnRef.current.getBoundingClientRect();
        const pickerWidth = 230;
        const viewportWidth = window.innerWidth;

        // Center picker relative to the specific Smile button
        let left = btnRect.left + btnRect.width / 2 - pickerWidth / 2;

        // Prevent overflow on right side
        if (left + pickerWidth > viewportWidth - 16) {
            left = viewportWidth - pickerWidth - 16;
        }

        // Prevent overflow on left side
        if (left < 16) left = 16;

        setPickerPos({ top: btnRect.top - 40, left });
    };

    // Show picker after delay when hovering the SMILE button
    const handleMouseEnterBtn = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        showTimeoutRef.current = setTimeout(() => {
            calculatePickerPosition();
            setShowPicker(true);
        }, 300);
    };

    // Hide picker after short delay when mouse leaves the Smile button
    const handleMouseLeave = () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 200);
    };

    // Keep picker visible when mouse enters it
    const handleMouseEnterPicker = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };

    // Toggle emoji reaction — blocked for own messages
    const handleReact = async (emoji: string) => {
        if (message.isOwn) return;
        try {
            setShowPicker(false);
            await api.post(`/messages/${message._id}/reactions`, { emoji }, { withCredentials: true });
        } catch (error) {
            console.error("Failed to react", error);
        }
    };

    // Delete message — for self only or for everyone (own messages only)
    const handleDelete = async (deleteForEveryone: boolean) => {
        try {
            await api.delete(`/messages/${message._id}`, {
                data: { deleteForEveryone },
                withCredentials: true
            });

            if (!deleteForEveryone) {
                // Remove from local store only — does not affect other users
                deleteMessageLocally(message._id);
            }
            // Delete for everyone is handled via socket event

            setOpenDeleteDialog(false);
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    // Show placeholder when message has been deleted for everyone
    if (message.deletedForEveryone) {
        return (
            <>
                {isShowTime && (
                    <span className="flex justify-center text-xs text-muted-foreground px-1">
                        {formatMessageTime(new Date(message.createdAt))}
                    </span>
                )}
                
                <div className={cn(
                    "flex gap-2 mt-1", 
                    message.isOwn ? "justify-end" : "justify-start"
                )}>
                    {/* Avatar for received messages */}
                    {!message.isOwn && (
                        <div className="w-8 shrink-0">
                            {isGroupBreak && (
                                <UserAvatar
                                    type="chat"
                                    name={participant?.displayName || "Verdi User"}
                                    avatarUrl={participant?.avatarUrl || undefined}
                                />
                            )}
                        </div>
                    )}

                    {/* Message content column */}
                    <div className={cn(
                        "flex flex-col max-w-[calc(100%-2.5rem)]",
                        message.isOwn ? "items-end" : "items-start"
                    )}>
                        <Card className={cn(
                            "p-3 border border-border/50 bg-background/50 shadow-none",
                            message.isOwn ? "rounded-br-sm" : "rounded-bl-sm"
                        )}>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                Message was deleted
                            </p>
                        </Card>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {isShowTime && (
                <span className="flex justify-center text-xs text-muted-foreground px-1">
                    {formatMessageTime(new Date(message.createdAt))}
                </span>
            )}

            <div className={cn(
                "flex gap-2 message-bounce mt-1 group",
                message.isOwn ? "justify-end" : "justify-start"
            )}>
                {/* Avatar for received messages */}
                {!message.isOwn && (
                    <div className="w-8 shrink-0">
                        {isGroupBreak && (
                            <UserAvatar
                                type="chat"
                                name={participant?.displayName || "Verdi User"}
                                avatarUrl={participant?.avatarUrl || undefined}
                            />
                        )}
                    </div>
                )}

                {/* Main content wrapper is a Column, holding the Row (Bubble + Buttons) and Reactions below */}
                <div className={cn(
                    "flex flex-col max-w-[calc(100%-2.5rem)]",
                    message.isOwn ? "items-end" : "items-start"
                )}>
                    
                    {/* This Row only contains the Image/Text Bubble and Action Buttons */}
                    <div className={cn(
                        "flex items-center gap-2",
                        message.isOwn ? "flex-row-reverse" : "flex-row"
                    )}>
                        {/* Message content column (Image + Text ONLY) */}
                        <div className={cn(
                            "max-w-xs lg:max-w-md flex flex-col",
                            message.isOwn ? "items-end" : "items-start"
                        )}>
                            {/* Image attachment */}
                            {message.imgUrl && (
                                <div
                                    className="cursor-pointer rounded-lg overflow-hidden border border-border/30"
                                    onClick={() => setLightboxOpen(true)}
                                >
                                    <img
                                        src={message.imgUrl}
                                        alt="message image"
                                        className="max-h-60 max-w-xs object-cover hover:opacity-90 transition-opacity"
                                    />
                                </div>
                            )}

                            {/* Text bubble */}
                            {message.content && (
                                <div className="relative pb-1">
                                    <Card className={cn(
                                        "p-3",
                                        message.isOwn ? "chat-bubble-sent border-0" : "chat-bubble-received"
                                    )}>
                                        {/* Quoted reply preview */}
                                        {message.replyTo && (
                                            <div className={cn(
                                                "mb-2 p-2 text-xs rounded-lg border-l-2 cursor-pointer",
                                                message.isOwn
                                                    ? "bg-black/10 border-white/60 text-white/80 hover:bg-black/20"
                                                    : "bg-black/5 dark:bg-white/5 border-primary text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
                                            )}>
                                                <p className={cn(
                                                    "font-semibold mb-0.5 text-[11px]",
                                                    message.isOwn ? "text-white" : "text-primary"
                                                )}>
                                                    {typeof message.replyTo.senderId === 'object'
                                                        ? (message.replyTo.senderId._id === user?._id ? "You" : message.replyTo.senderId.displayName)
                                                        : (message.replyTo.senderId === user?._id
                                                            ? "You"
                                                            : selectedConv.participants.find(p => p._id === message.replyTo?.senderId)?.displayName ?? "Unknown")
                                                    }
                                                </p>
                                                <p className="truncate max-w-[200px] opacity-80">
                                                    {message.replyTo.content || (message.replyTo.imgUrl ? "Image" : "Message")}
                                                </p>
                                            </div>
                                        )}

                                        {/* Message text with search highlight */}
                                        <p className="text-sm leading-relaxed break-words">
                                            <HighlightText text={message.content} query={searchQuery} />
                                        </p>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* Action buttons wrapper */}
                        <div
                            className={cn(
                                "transition-opacity flex items-center gap-1.5 relative shrink-0",
                                showPicker ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                        >
                            {/* Emoji reaction button — only for received messages */}
                            {!message.isOwn && (
                                <button
                                    ref={btnRef}
                                    onMouseEnter={handleMouseEnterBtn}
                                    onMouseLeave={handleMouseLeave}
                                    type="button"
                                    className="flex items-center justify-center size-7 rounded-full bg-background border border-border/40 shadow-sm hover:scale-110 hover:bg-muted transition-all"
                                >
                                    <Smile className="size-4 text-muted-foreground" />
                                </button>
                            )}

                            {/* Reply button — available for all messages */}
                            <button
                                type="button"
                                onClick={() => setReplyingTo(message)}
                                className="flex items-center justify-center size-7 rounded-full bg-background border border-border/40 shadow-sm hover:scale-110 hover:bg-muted transition-all"
                            >
                                <Reply className="size-4 text-muted-foreground" />
                            </button>

                            {/* Delete button — available for all messages */}
                            <button
                                type="button"
                                onClick={() => setOpenDeleteDialog(true)}
                                className="flex items-center justify-center size-7 rounded-full bg-background border border-border/40 shadow-sm hover:scale-110 hover:bg-muted transition-all"
                            >
                                <Trash2 className="size-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Reactions are displayed OUTSIDE the row, below the message bubble */}
                    {Object.keys(reactionGroups).length > 0 && (
                        <div className={cn("flex flex-wrap gap-1 mt-1", message.isOwn ? "justify-end" : "justify-start")}>
                            {Object.entries(reactionGroups).map(([emoji, userIds]) => {
                                const iReacted = userIds.includes(user?._id ?? "");
                                return (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => handleReact(emoji)}
                                        className={cn(
                                            "flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-all",
                                            iReacted
                                                ? "bg-primary/20 border-primary/40 text-primary"
                                                : "bg-muted border-border/30 hover:bg-muted/80"
                                        )}
                                    >
                                        <span>{emoji}</span>
                                        <span>{userIds.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Seen or delivered status for last own message */}
                    {message.isOwn && message._id === selectedConv.lastMessage?._id && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs px-1.5 py-0.5 h-4 border-0 mt-1",
                                lastMessageStatus === "seen"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {lastMessageStatus}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Emoji picker rendered as portal to avoid clipping */}
            {showPicker && !message.isOwn && createPortal(
                <div
                    ref={pickerRef}
                    onMouseEnter={handleMouseEnterPicker}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        position: 'fixed',
                        top: pickerPos.top,
                        left: pickerPos.left,
                        zIndex: 9999,
                    }}
                    className="flex gap-1 p-1.5 rounded-full shadow-xl border border-border/30 bg-background whitespace-nowrap"
                >
                    {QUICK_EMOJIS.map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReact(emoji)}
                            className="text-lg hover:scale-125 transition-transform leading-none"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* Image lightbox dialog */}
            {message.imgUrl && (
                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                    <DialogContent className="max-w-3xl border-none bg-black/90 p-2">
                        <img
                            src={message.imgUrl}
                            alt="full size"
                            className="w-full h-full object-contain max-h-[80vh] rounded-lg"
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent className="sm:max-w-[320px] border-none">
                    <DialogHeader>
                        <DialogTitle>Delete Message?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Choose how you want to delete this message.
                    </p>
                    <div className="flex flex-col gap-2 mt-2">
                        {/* Delete only for self */}
                        <Button
                            variant="completeGhost"
                            onClick={() => handleDelete(false)}
                            className="w-full justify-start hover:text-warning hover:bg-warning/10"
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete for me
                        </Button>

                        {/* Delete for everyone — own messages only */}
                        {message.isOwn && (
                            <Button
                                variant="completeGhost"
                                onClick={() => handleDelete(true)}
                                className="w-full justify-start hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="size-4 mr-2" />
                                Delete for everyone
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            onClick={() => setOpenDeleteDialog(false)}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MessageItem;
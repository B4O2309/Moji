import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { cn, formatMessageTime } from "@/lib/utils";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { Smile } from "lucide-react";
import api from "@/lib/axios";

const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

interface MessageItemProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConv: Conversation;
    lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({ message, index, messages, selectedConv, lastMessageStatus }: MessageItemProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});
    const { user } = useAuthStore();
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
    const isShowTime = index === 0 ||
        new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime() > 300000;
    const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

    const participant = selectedConv.participants.find(
        (p: Participant) => p._id.toString() === message.senderId.toString()
    );

    const reactionGroups = (message.reactions ?? []).reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r.userId);
        return acc;
    }, {} as Record<string, string[]>);

    // Calculate picker position based on message alignment and available space
    const calculatePickerPosition = () => {
        if (!btnRef.current) return;

        const btnRect = btnRef.current.getBoundingClientRect();
        const pickerWidth = 220; // ước tính width picker
        const chatWindow = document.getElementById('chat-window');
        const chatRect = chatWindow?.getBoundingClientRect();

        if (!chatRect) return;

        let left: number | undefined;
        let right: number | undefined;

        if (message.isOwn) {
            // Message on the right → try to align picker to the right of button
            const rightSpace = btnRect.right - chatRect.left;
            if (rightSpace < pickerWidth) {
                // Không đủ chỗ bên phải → căn trái
                left = 0;
            } else {
                right = 0;
            }
        } else {
            // Message on the left → try to align picker to the left of button
            const leftSpace = btnRect.left - chatRect.left;
            const rightSpace = chatRect.right - btnRect.left;
            if (rightSpace < pickerWidth) {
                right = 0;
            } else {
                left = 0;
            }
        }

        setPickerStyle({ left, right });
    };

    const handleMouseEnterBtn = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        calculatePickerPosition();
        setShowPicker(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => setShowPicker(false), 200);
    };

    const handleMouseEnterPicker = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };

    const handleReact = async (emoji: string) => {
        if (message.isOwn) return;

        try {
            setShowPicker(false);
            await api.post(`/messages/${message._id}/reactions`, { emoji }, { withCredentials: true });
        } catch (error) {
            console.error("Failed to react", error);
        }
    };

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
                {!message.isOwn && (
                    <div className="w-8">
                        {isGroupBreak && (
                            <UserAvatar
                                type="chat"
                                name={participant?.displayName || "Verdi User"}
                                avatarUrl={participant?.avatarUrl || undefined}
                            />
                        )}
                    </div>
                )}

                <div className={cn(
                    "max-w-xs lg:max-w-md flex flex-col",
                    message.isOwn ? "items-end" : "items-start"
                )}>
                    {/* Image */}
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
                                <p className="text-sm leading-relaxed break-words">{message.content}</p>
                            </Card>

                            {/* Reaction button */}
                            {!message.isOwn && (
                                <div
                                    ref={btnRef}
                                    className={cn(
                                        "absolute -bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                                        message.isOwn ? "left-2" : "right-2"
                                    )}
                                    onMouseEnter={handleMouseEnterBtn}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <button
                                        type="button"
                                        className="flex items-center justify-center size-5 rounded-full bg-background border border-border/40 shadow-sm hover:scale-110 transition-transform"
                                    >
                                        <Smile className="size-3 text-muted-foreground" />
                                    </button>

                                    {/* Emoji Picker */}
                                    {showPicker && (
                                        <div
                                            ref={pickerRef}
                                            onMouseEnter={handleMouseEnterPicker}
                                            onMouseLeave={handleMouseLeave}
                                            style={pickerStyle}
                                            className="absolute bottom-full mb-2 flex gap-1 p-1.5 rounded-full shadow-lg border border-border/30 bg-background z-50 whitespace-nowrap"
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
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reactions display */}
                    {Object.keys(reactionGroups).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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

                    {/* Seen/Delivered */}
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

            {/* Lightbox */}
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
        </>
    );
};

export default MessageItem;
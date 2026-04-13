import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useEffect, useState } from "react"
import { authService } from "@/services/authService"
import UserAvatar from "../chat/UserAvatar"
import { useSocketStore } from "@/stores/useSocketStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useFriendStore } from "@/stores/useFriendStore"
import { Loader2, UserPlus, UserCheck, Ban } from "lucide-react"
import AddFriendModal from "../chat/AddFriendModal"
import StatusBadge from "../chat/StatusBadge"
import { useBlockStore } from "@/stores/useBlockStore";
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

interface UserProfileDialogProps {
    userId: string | null;
    onClose: () => void;
}

interface PublicUser {
    _id: string;
    displayName: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
}

const UserProfileDialog = ({ userId, onClose }: UserProfileDialogProps) => {
    const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [openAddFriend, setOpenAddFriend] = useState(false);
    const { onlineUsers } = useSocketStore();
    const { user } = useAuthStore();
    const { friends, getFriends } = useFriendStore();
    const { isBlocked, blockUser, unblockUser, loading: blockLoading } = useBlockStore();
    const [openUnfriend, setOpenUnfriend] = useState(false);
    const [openConfirmBlock, setOpenConfirmBlock] = useState(false);

    const [blockStatus, setBlockStatus] = useState({ iBlockedThem: false, theyBlockedMe: false });

    useEffect(() => {
        if (!userId) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const [u, status] = await Promise.all([
                    authService.getUserById(userId),
                    useBlockStore.getState().getBlockStatus(userId)
                ]);
                setProfileUser(u);
                setBlockStatus(status);
            } catch {
                setProfileUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [userId]);

    const isOnline = profileUser ? onlineUsers.includes(profileUser._id) : false;
    const isMe = profileUser?._id === user?._id;
    const isFriend = friends.some(f => f._id === profileUser?._id);

    return (
        <>
            <Dialog open={!!userId} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[360px] border-none p-0 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="px-6 pb-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : profileUser ? (
                            <>
                                <div className="flex items-end justify-between -mt-10 mb-3">
                                    {/* Avatar + dot status */}
                                    <div className="relative">
                                        <UserAvatar
                                            type="profile"
                                            name={profileUser.displayName}
                                            avatarUrl={profileUser.avatarUrl}
                                            className="ring-4 ring-background shadow-lg"
                                        />
                                        <StatusBadge status={isOnline ? "online" : "offline"} size="md" />
                                    </div>

                                    {/* Friend status button */}
                                    {isFriend ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setOpenUnfriend(true)}
                                                className="flex items-center gap-1.5 text-xs font-medium
                                                text-emerald-600 border border-emerald-300 rounded-full px-3 py-1.5 mb-1
                                                hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40
                                                transition-all duration-200"
                                            >
                                                <UserCheck className="size-3.5" />
                                                Friends
                                            </button>
                                        </>
                                    ) : profileUser?.username ? (
                                        <button
                                            type="button"
                                            onClick={() => setOpenAddFriend(true)}
                                            className="flex items-center gap-1.5 text-xs font-medium
                                            text-primary hover:opacity-80 transition mb-1
                                            border border-primary/30 rounded-full px-3 py-1.5"
                                        >
                                            <UserPlus className="size-3.5" />
                                            Add Friend
                                        </button>
                                    ) : null}
                                    {!isMe && (
                                        <>
                                            {/* Block/Unblock với confirm */}
                                            {blockStatus.iBlockedThem ? (
                                                // Unblock không cần confirm
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        await unblockUser(profileUser!._id);
                                                        setBlockStatus(prev => ({ ...prev, iBlockedThem: false }));
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 mb-1 rounded-full px-3 py-1.5 border bg-destructive/10 text-destructive border-destructive/40 hover:bg-destructive hover:text-white"
                                                >
                                                    <Ban className="size-3.5" />
                                                    Unblock
                                                </button>
                                            ) : (
                                                // Block cần confirm
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenConfirmBlock(true)}
                                                    className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 mb-1 rounded-full px-3 py-1.5 border bg-transparent text-muted-foreground border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                                                >
                                                    <Ban className="size-3.5" />
                                                    Block
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                <h2 className="text-lg font-semibold">{profileUser.displayName}</h2>

                                {profileUser.username && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                        @{profileUser.username}
                                    </p>
                                )}

                                {profileUser.bio ? (
                                    <p className="text-sm text-foreground/80 mt-2 border-t border-border/30 pt-3">
                                        {profileUser.bio}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-2 border-t border-border/30 pt-3 italic">
                                        No bio yet.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                User not found.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {profileUser?.username && (
                <AddFriendModal
                    open={openAddFriend}
                    onOpenChange={setOpenAddFriend}
                    defaultUsername={profileUser.username}
                    showTrigger={false}
                />
            )}
            {/* Confirm unfriend dialog */}
            <Dialog open={openUnfriend} onOpenChange={setOpenUnfriend}>
                <DialogContent className="sm:max-w-[320px] border-none">
                    <DialogHeader>
                        <DialogTitle>Remove Friend?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to unfriend{" "}
                        <span className="font-medium text-foreground">
                            {profileUser?.displayName}
                        </span>
                        ? You can always send a friend request again later.
                    </p>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenUnfriend(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                                await useFriendStore.getState().unfriend(profileUser!._id);
                                setOpenUnfriend(false);
                            }}
                        >
                            Remove Friend
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm block dialog */}
            <Dialog open={openConfirmBlock} onOpenChange={setOpenConfirmBlock}>
                <DialogContent className="sm:max-w-[320px] border-none">
                    <DialogHeader>
                        <DialogTitle>Block User?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to block{" "}
                        <span className="font-medium text-foreground">{profileUser?.displayName}</span>?
                        They won't be able to send you messages.
                    </p>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button variant="outline" size="sm" onClick={() => setOpenConfirmBlock(false)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                                await blockUser(profileUser!._id);
                                setBlockStatus(prev => ({ ...prev, iBlockedThem: true }));
                                setOpenConfirmBlock(false);
                            }}
                        >
                            Block
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserProfileDialog;
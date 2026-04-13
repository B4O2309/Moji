import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useEffect, useState } from "react"
import { useFriendStore } from "@/stores/useFriendStore"
import { useBlockStore } from "@/stores/useBlockStore"
import UserAvatar from "../chat/UserAvatar"
import { Button } from "../ui/button"
import { ShieldBan, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

interface BlockUsersDialogProps {
    open: boolean;
    onClose: () => void;
}

const BlockUsersDialog = ({ open, onClose }: BlockUsersDialogProps) => {
    const { friends, getFriends } = useFriendStore();
    const { blockedUsers, fetchBlockedUsers, blockUser, unblockUser, loading } = useBlockStore();
    const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
    const [confirmName, setConfirmName] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<"block" | "unblock">("block");

    useEffect(() => {
        if (open) {
            getFriends();
            fetchBlockedUsers();
        }
    }, [open]);

    // Not blocked friends (for block tab)
    const blockedIds = blockedUsers.map(u => u._id);
    const friendsNotBlocked = friends.filter(f => !blockedIds.includes(f._id));

    const handleConfirm = async () => {
        if (!confirmUserId) return;
        if (confirmAction === "block") {
            await blockUser(confirmUserId);
        } else {
            await unblockUser(confirmUserId);
        }
        setConfirmUserId(null);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[380px] border-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldBan className="h-5 w-5 text-primary" />
                            Block Users
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="friends">
                        <TabsList className="grid w-full grid-cols-2 glass-light">
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                            <TabsTrigger value="blocked">
                                Blocked
                                {blockedUsers.length > 0 && (
                                    <span className="ml-1.5 text-[10px] bg-destructive text-white rounded-full px-1.5 py-0.5">
                                        {blockedUsers.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Friends — block */}
                        <TabsContent value="friends">
                            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 beautiful-scrollbar mt-2">
                                {friendsNotBlocked.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No friends to block.
                                    </p>
                                ) : (
                                    friendsNotBlocked.map((friend) => (
                                        <div key={friend._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition">
                                            <UserAvatar type="sidebar" name={friend.displayName} avatarUrl={friend.avatarUrl ?? undefined} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{friend.displayName}</p>
                                                {friend.username && (
                                                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                                                onClick={() => {
                                                    setConfirmUserId(friend._id);
                                                    setConfirmName(friend.displayName);
                                                    setConfirmAction("block");
                                                }}
                                            >
                                                <ShieldBan className="size-3.5 mr-1" />
                                                Block
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab Blocked — unblock */}
                        <TabsContent value="blocked">
                            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 beautiful-scrollbar mt-2">
                                {blockedUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        You haven't blocked anyone.
                                    </p>
                                ) : (
                                    blockedUsers.map((blocked) => (
                                        <div key={blocked._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition">
                                            <UserAvatar type="sidebar" name={blocked.displayName} avatarUrl={blocked.avatarUrl ?? undefined} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{blocked.displayName}</p>
                                                {blocked.username && (
                                                    <p className="text-xs text-muted-foreground">@{blocked.username}</p>
                                                )}
                                            </div>
                                            {/* Unblock Button */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="shrink-0 text-primary border-primary/30 bg-primary/5 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-400 transition-all duration-200"
                                                onClick={() => {
                                                    setConfirmUserId(blocked._id);
                                                    setConfirmName(blocked.displayName);
                                                    setConfirmAction("unblock");
                                                }}
                                            >
                                                <ShieldCheck className="size-3.5 mr-1" />
                                                Unblock
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Confirm dialog */}
            <Dialog open={!!confirmUserId} onOpenChange={() => setConfirmUserId(null)}>
                <DialogContent className="sm:max-w-[320px] border-none">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction === "block" ? "Block User?" : "Unblock User?"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {confirmAction === "block" ? (
                            <>Are you sure you want to block <span className="font-medium text-foreground">{confirmName}</span>? They won't be able to send you messages.</>
                        ) : (
                            <>Are you sure you want to unblock <span className="font-medium text-foreground">{confirmName}</span>? They will be able to send you messages again.</>
                        )}
                    </p>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button variant="outline" size="sm" onClick={() => setConfirmUserId(null)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant={confirmAction === "block" ? "destructive" : "default"}
                            className={confirmAction === "unblock" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                            disabled={loading}
                            onClick={handleConfirm}
                        >
                            {confirmAction === "block" ? "Block" : "Unblock"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BlockUsersDialog;
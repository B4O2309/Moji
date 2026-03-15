import { useFriendStore } from "@/stores/useFriendStore";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { MessageCircleMore } from "lucide-react";
import { Card } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";

const FriendListModal = () => {
    const {friends} = useFriendStore();

    return (
        <DialogContent className="glass max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl capitalize">
                    <MessageCircleMore className="size-5"/>
                    Create a new conversation
                </DialogTitle>
            </DialogHeader>

            {/* Friends List */}
            <div className="space-y-4">
                <h1 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                    Friends List
                </h1>

                <div>
                    {friends.map((friend) => (
                        <Card 
                            key={friend._id}
                            className="p-3 cursor-pointer transition-smooth hover:shadown-soft glass
                            hover:bg-muted/30 group/friendCard"
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative">
                                </div>
                                {/* Info */}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DialogContent>
    );
};

export default FriendListModal;
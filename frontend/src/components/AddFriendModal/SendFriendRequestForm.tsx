import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import type { IFormValues } from "../chat/AddFriendModal";
import type { UseFormRegister } from "react-hook-form";

interface SendRequestProps {
    register: UseFormRegister<IFormValues>;
    loading: boolean;
    searchedUsername: string;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
}

const SendFriendRequestForm = ({
    register,
    loading,
    searchedUsername,
    onSubmit,
    onBack
}: SendRequestProps) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-4">
                <span className="success-message">
                    Found user <span className="font-semibold">@{searchedUsername} 🎉</span>
                </span>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">
                        Message
                    </Label>
                    <Textarea
                        id="message"
                        rows={3}
                        placeholder="Hello! I'd like to add you as a friend."
                        className="glass border-border/50 focus:border-primary/50 transition-smooth resize-none"
                        {...register("message")}
                    />
                </div>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={onBack}
                        className="flex-1 glass hover:text-destructive"
                    >
                        Back
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
                    >
                        {loading ? (
                            <span>Sending...</span>
                        ) : (
                            <>
                                <UserPlus className="size-4 mr-2"/>Add Friend
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </div>
        </form>
    );
}

export { SendFriendRequestForm };
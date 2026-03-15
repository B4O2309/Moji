import {useEffect, useState, type Dispatch, type SetStateAction} from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { useFriendStore } from "@/stores/useFriendStore";
import SentRequests from "./SentRequests";
import ReceivedRequests from "./ReceivedRequests";

interface FriendRequestDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const FriendRequestDialog = ({open, setOpen}: FriendRequestDialogProps) => {
    const [tab, setTab] = useState("received");
    const {getAllFriendRequests} = useFriendStore();

    useEffect(() => {
        const loadRequests = async () => {
            try {
                await getAllFriendRequests();
            }
            catch (error) {
                console.error("Error loading friend requests:", error);
            }
        };

        loadRequests();
    }, []);

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Friend Requests</DialogTitle>
                </DialogHeader>
                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received">Received</TabsTrigger>
                        <TabsTrigger value="sent">Sent</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received">
                        <ReceivedRequests/>
                    </TabsContent>

                    <TabsContent value="sent">
                        <SentRequests/>
                    </TabsContent>

                </Tabs>
            </DialogContent>
        </Dialog>
    )
};

export default FriendRequestDialog;
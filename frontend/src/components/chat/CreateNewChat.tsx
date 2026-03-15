import { useFriendStore } from "@/stores/useFriendStore";
import { Card } from "../ui/card";
import FriendListModal from "../createNewChat/FriendListModal";

const CreateNewChat = () => {
    const {getFriends} = useFriendStore();

    const handleGetFriends = async () => {
        await getFriends();
    }
    
    return (
        <Card onClick={handleGetFriends} className="hover:scale/110 transition-bounce glass flex items-center justify-center h-16 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors">
            <h2 className="text-sm font-medium text-white">+ New Chat</h2>
            <FriendListModal/>
        </Card>
    );
}

export default CreateNewChat;
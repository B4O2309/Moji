import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return;

    const directConversations = conversations.filter((conv) => conv.type === 'direct');

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {
                directConversations.map((conv) => (
                    <DirectMessageCard
                        conv={conv}
                        key={conv._id}
                    />
                ))
            }
        </div>
    );
}

export default DirectMessageList;
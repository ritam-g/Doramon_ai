import { setError, setLoading, setChats, setCurrentChatId } from "../../../app/store/features/chat.slice";
import { sendMessage, getChat, getMessage, deleteMessage } from "../services/chat.api";
import { initializedSocketConnection } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";

export function useChat() {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat?.chats ?? {});

    async function handelSendMessage({ message, chatId }) {
        try {
            dispatch(setLoading(true));

            // API returns chatId, chat, userMessage, and aiMessage.
            // Rename chatId to activeChatId because chatId is already a function parameter.
            // what ever chat Id is come it will store in activechatId
            const { chatId: activeChatId, chat, userMessage, aiMessage } = await sendMessage({ message, chatId });

            const oldChat = chats[activeChatId] ?? {};

            // Simple chat format in Redux:
            // {
            //   _id: "chatId1",
            //   id: "chatId1",
            //   title: "JavaScript Doubts",
            //   messages: [
            //     { role: "user", content: "What is closure?" },
            //     { role: "ai", content: "Closure is..." }
            //   ],
            //   lastUpdated: "2026-03-19T10:30:00Z"
            // }
            // Save the updated chat inside chats.
            dispatch(setChats({
                ...chats,
                [activeChatId]: {
                    _id: activeChatId,
                    id: activeChatId,
                    title: chat?.title || oldChat.title || "New Chat",
                    messages: [
                        ...(oldChat.messages || []),
                        userMessage,
                        aiMessage,
                    ],
                    lastUpdated: aiMessage?.createdAt || new Date().toISOString(),
                },
            }));

            dispatch(setCurrentChatId(activeChatId));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handelSendMessage,
        initializedSocketConnection,
    };
}

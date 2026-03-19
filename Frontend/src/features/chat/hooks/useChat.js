import {
    setError,
    setLoading,
    setCurrentChatId,
    createNewChat,
    addMessage,
    setChats,
} from "../../../app/store/features/chat.slice";
import { sendMessage, getChat, getMessage } from "../services/chat.api";
import { initializedSocketConnection } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";

function mapMessages(messages = []) {
    return messages.map((message) => ({
        id: message._id || message.id,
        role: message.role,
        content: message.content,
    }));
}

export function useChat() {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat?.chats ?? {});
    const currentChatId = useSelector((state) => state.chat?.currentChatId ?? null);

    function initializeSocketConnection() {
        initializedSocketConnection();
    }

    async function handleSendMessage({ message, chatId }) {
        try {
            dispatch(setLoading(true));

            const { chatId: activeChatId, chat, userMessage, aiMessage } = await sendMessage({ message, chatId });

            dispatch(createNewChat({
                chatId: activeChatId,
                title: chat?.title || chats[activeChatId]?.title || "New Chat",
            }));

            dispatch(addMessage({
                chatId: activeChatId,
                message: userMessage?.content || message,
                role: "user",
                messageId: userMessage?._id,
            }));

            dispatch(addMessage({
                chatId: activeChatId,
                message: aiMessage?.content || "",
                role: "ai",
                messageId: aiMessage?._id,
            }));

            dispatch(setCurrentChatId(activeChatId));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetChats() {
        try {
            dispatch(setLoading(true));

            const data = await getChat();
            const nextChats = (data.chats || []).reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title || "New Chat",
                    messages: chats[chat._id]?.messages || [],
                    lastUpdated: chat.updatedAt || chat.createdAt || new Date().toISOString(),
                };
                return acc;
            }, {});

            dispatch(setChats(nextChats));

            if (!currentChatId && data.chats?.length) {
                dispatch(setCurrentChatId(data.chats[0]._id));
            }
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleOpenChat(chatId) {
        try {
            dispatch(setLoading(true));

            const data = await getMessage({ chatId });
            const selectedChat = chats[chatId] || {};

            dispatch(setChats({
                ...chats,
                [chatId]: {
                    id: chatId,
                    title: selectedChat.title || "New Chat",
                    messages: mapMessages(data.messages || []),
                    lastUpdated: selectedChat.lastUpdated || new Date().toISOString(),
                },
            }));

            dispatch(setCurrentChatId(chatId));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        initializeSocketConnection,
        // keep old names so existing callers do not break
        handelSendMessage: handleSendMessage,
        handelGetChats: handleGetChats,
        initializedSocketConnection: initializeSocketConnection,
    };
}

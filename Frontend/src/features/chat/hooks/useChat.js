import {
    setError,
    setLoading,
    setCurrentChatId,
    createNewChat,
    addMessage,
    setChats,
    appendToMessage,
} from "../../../app/store/features/chat.slice";
import { getChat, getMessage } from "../services/chat.api";
import { initializedSocketConnection, getSocket } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";

// ===== Message Normalization =====
// 👉 Backend can return `_id`, while the UI expects a consistent `id` for React keys and lookups.
function mapMessages(messages = []) {
    return messages.map((message) => ({
        id: message._id || message.id,
        role: message.role,
        content: message.content,
    }));
}

// ===== useChat Hook =====
// 👉 Centralizes chat-related API calls so components stay focused on rendering.
export function useChat() {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat?.chats ?? {});
    const currentChatId = useSelector((state) => state.chat?.currentChatId ?? null);

    // ===== Socket Setup =====
    function initializeSocketConnection() {
        initializedSocketConnection();
    }

    // ===== Send Message Flow =====
    async function handleSendMessage({ message, chatId, file }) {
        try {
            dispatch(setLoading(true));

            const socket = getSocket();
            if (!socket) throw new Error("Socket not initialized");

            const activeChatId = chatId || `temp_${Date.now()}`;

            // 1. Dispatch new chat if not exists
            if (!chatId) {
                dispatch(createNewChat({
                    chatId: activeChatId,
                    title: message.substring(0, 20) || "New Chat",
                }));
                dispatch(setCurrentChatId(activeChatId));
            }

            // 2. Add user message
            dispatch(addMessage({
                chatId: activeChatId,
                message: message,
                role: "user",
                messageId: `user_${Date.now()}`,
            }));

            // 3. Add empty ai message for streaming
            dispatch(addMessage({
                chatId: activeChatId,
                message: "",
                role: "ai",
                messageId: `ai_${Date.now()}`,
            }));

            // 4. Emit via socket
            socket.emit("ask", { message, chatId: activeChatId, file });

            const onStream = (chunk) => {
                dispatch(appendToMessage({
                    chatId: activeChatId,
                    chunk
                }));
            };

            const onDone = (payload) => {
                socket.off("stream", onStream);
                socket.off("done", onDone);
                dispatch(setLoading(false));
                
                // If this was a new chat, updating ID safely via getChats
                if (!chatId && payload?.chatId) {
                    dispatch(setCurrentChatId(payload.chatId));
                    handleGetChats();
                }
            };

            socket.on("stream", onStream);
            socket.on("done", onDone);

        } catch (error) {
            dispatch(setError(error.message));
            dispatch(setLoading(false));
        }
    }

    // ===== Sidebar History Fetch =====
    async function handleGetChats() {
        try {
            dispatch(setLoading(true));

            const data = await getChat();

            // 👉 Convert the API array into an object keyed by chat id for fast Redux access.
            // 👉 Default to a new chat if none exist.
            // it will be for reloding the page
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

            // 👉 Default to the newest available chat so the UI has an active thread.
            if (!currentChatId && data.chats?.length) {
                dispatch(setCurrentChatId(data.chats[0]._id));
            }
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    // ===== Open Existing Chat =====
    async function handleOpenChat(chatId) {
        try {
            dispatch(setLoading(true));

            // 👉 Sidebar only stores summary data, so opening a chat hydrates full messages on demand.
            const data = await getMessage({ chatId });
            const selectedChat = chats[chatId] || {};

            // 👉 Merge the loaded conversation back into the existing map without losing other chats.
            dispatch(setChats({
                ...chats,
                [chatId]: {
                    id: chatId,
                    title: selectedChat.title || "New Chat",
                    // 👉 Replace the existing chat messages with the loaded messages.
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
        // 👉 Keep legacy names so older callers do not break while the app migrates.
        handelSendMessage: handleSendMessage,
        handelGetChats: handleGetChats,
        initializedSocketConnection: initializeSocketConnection,
    };
}

import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import { generateResponse } from "../utils/generateResponse";

const createId = (prefix) =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const stripMarkdown = (value) =>
    value
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/[*_>#-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const createMessage = (role, content, createdAt = new Date().toISOString()) => ({
    id: createId(role),
    role,
    content,
    createdAt,
});

const createSeedChats = () => {
    const now = Date.now();

    return [
        {
            id: "chat-modern-dashboard",
            title: "Modern Chatbot UI",
            updatedAt: new Date(now - 1000 * 60 * 8).toISOString(),
            messages: [
                createMessage(
                    "assistant",
                    "Hello! I'm your local AI workspace. Ask for UI ideas, code structure, or a quick review."
                ),
                createMessage(
                    "user",
                    "I need a polished chatbot dashboard for a React app. It should feel modern and easy to scan."
                ),
                createMessage(
                    "assistant",
                    "Here is a strong starting direction:\n\n- Keep the sidebar compact and searchable.\n- Use a clear contrast split between the conversation canvas and chrome.\n- Reserve the accent color for actions and the user bubble.\n\nIf you want, I can sketch the component breakdown next."
                ),
            ],
        },
        {
            id: "chat-release-plan",
            title: "Release Planning",
            updatedAt: new Date(now - 1000 * 60 * 44).toISOString(),
            messages: [
                createMessage("user", "Can you help me organize a release plan for next week?"),
                createMessage(
                    "assistant",
                    "Yes. Start with three buckets: `must ship`, `safe to defer`, and `post-release monitoring`."
                ),
            ],
        },
        {
            id: "chat-debug-session",
            title: "Debug Session",
            updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
            messages: [
                createMessage("user", "My API works locally but fails in staging with a 401."),
                createMessage(
                    "assistant",
                    "Check config drift first:\n\n- base URL\n- auth header shape\n- token audience\n- proxy rewrites"
                ),
            ],
        },
        {
            id: "chat-content-ideas",
            title: "Content Ideas",
            updatedAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
            messages: [
                createMessage("user", "Give me a few launch tweet ideas for an AI notes app."),
                createMessage(
                    "assistant",
                    "I can do that. Tell me whether you want crisp, technical, or playful tone."
                ),
            ],
        },
    ];
};

const getChatPreview = (messages) => {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
        return "Fresh chat. Send a message to begin.";
    }

    const preview = stripMarkdown(lastMessage.content);
    return preview.length > 72 ? `${preview.slice(0, 72).trimEnd()}...` : preview;
};

const buildChatTitle = (chat, prompt) => {
    const compactPrompt = stripMarkdown(prompt);

    if (!compactPrompt) {
        return chat.title;
    }

    if (chat.title !== "New Chat" || chat.messages.length > 0) {
        return chat.title;
    }

    return compactPrompt.length > 32
        ? `${compactPrompt.slice(0, 32).trimEnd()}...`
        : compactPrompt;
};

const createEmptyChat = () => ({
    id: createId("chat"),
    title: "New Chat",
    updatedAt: new Date().toISOString(),
    messages: [],
});

const reorderChats = (nextChat, chats) => [nextChat, ...chats.filter((chat) => chat.id !== nextChat.id)];

function Dashboard() {
    const [chats, setChats] = useState(() => createSeedChats());
    const [activeChatId, setActiveChatId] = useState("chat-modern-dashboard");
    const [draft, setDraft] = useState("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [pendingResponses, setPendingResponses] = useState({});
    const timeoutIdsRef = useRef(new Set());

    const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
            timeoutIdsRef.current.clear();
        };
    }, []);

    const incrementPendingResponses = (chatId) => {
        setPendingResponses((current) => ({
            ...current,
            [chatId]: (current[chatId] ?? 0) + 1,
        }));
    };

    const decrementPendingResponses = (chatId) => {
        setPendingResponses((current) => {
            const nextCount = Math.max((current[chatId] ?? 1) - 1, 0);

            if (!nextCount) {
                const { [chatId]: _removed, ...rest } = current;
                return rest;
            }

            return {
                ...current,
                [chatId]: nextCount,
            };
        });
    };

    const handleSelectChat = (chatId) => {
        setActiveChatId(chatId);
        setIsMobileSidebarOpen(false);
    };

    const handleCreateChat = () => {
        const newChat = createEmptyChat();

        setChats((current) => [newChat, ...current]);
        setActiveChatId(newChat.id);
        setDraft("");
        setIsMobileSidebarOpen(false);
    };

    const handleSendMessage = (submittedMessage) => {
        const content = submittedMessage.trim();

        if (!content) {
            return;
        }

        const userMessage = createMessage("user", content);
        let targetChatId = activeChatId;

        if (!targetChatId) {
            const newChat = createEmptyChat();
            targetChatId = newChat.id;
            setChats((current) => [newChat, ...current]);
            setActiveChatId(newChat.id);
        }

        setDraft("");

        setChats((current) => {
            const targetChat = current.find((chat) => chat.id === targetChatId);

            if (!targetChat) {
                return current;
            }

            const updatedChat = {
                ...targetChat,
                title: buildChatTitle(targetChat, content),
                updatedAt: userMessage.createdAt,
                messages: [...targetChat.messages, userMessage],
            };

            return reorderChats(updatedChat, current);
        });

        incrementPendingResponses(targetChatId);

        const responseDelay = 900 + Math.floor(Math.random() * 1400);
        const timeoutId = window.setTimeout(() => {
            const assistantMessage = createMessage("assistant", generateResponse(content));

            setChats((current) => {
                const targetChat = current.find((chat) => chat.id === targetChatId);

                if (!targetChat) {
                    return current;
                }

                const updatedChat = {
                    ...targetChat,
                    updatedAt: assistantMessage.createdAt,
                    messages: [...targetChat.messages, assistantMessage],
                };

                return reorderChats(updatedChat, current);
            });

            decrementPendingResponses(targetChatId);
            timeoutIdsRef.current.delete(timeoutId);
        }, responseDelay);

        timeoutIdsRef.current.add(timeoutId);
    };

    return (
        <div className="inspect-dashboard chat-dashboard relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-10rem] top-[-12rem] h-80 w-80 rounded-full bg-emerald-400/14 blur-3xl" />
                <div className="absolute right-[-12rem] top-24 h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
                <div className="absolute bottom-[-10rem] left-1/3 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-20" />
            </div>

            <div className="inspect-dashboard-layout relative flex h-screen">
                <Sidebar
                    chats={chats.map((chat) => ({
                        ...chat,
                        preview: getChatPreview(chat.messages),
                    }))}
                    activeChatId={activeChatId}
                    isCollapsed={isSidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                    onCreateChat={handleCreateChat}
                    onSelectChat={handleSelectChat}
                    onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <ChatWindow
                        chat={activeChat}
                        isResponding={Boolean(activeChat && pendingResponses[activeChat.id])}
                        onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                    />
                    <ChatInput
                        value={draft}
                        onChange={setDraft}
                        onSubmit={handleSendMessage}
                        disabled={!draft.trim()}
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

import { memo } from "react";

const previewDateFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
});

const calendarFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

const formatTimestamp = (timestamp) => {
    const parsedDate = new Date(timestamp);
    const now = new Date();
    const sameDay = parsedDate.toDateString() === now.toDateString();

    if (sameDay) {
        return previewDateFormatter.format(parsedDate);
    }

    return calendarFormatter.format(parsedDate);
};

function PlusIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function PanelIcon({ collapsed }) {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M8 10h8M8 14h5m-6.5 5H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-3.5 3z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function SparkIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 16l-1.7-5L6 9.3l4.3-1.7L12 3zM5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8L5 17zm14-2l1 2.7 2.7 1L20 19.7 19 22l-1-2.3-2.7-1L18 17.7 19 15z"
                fill="currentColor"
            />
        </svg>
    );
}

const ChatListItem = memo(function ChatListItem({
    chat,
    isActive,
    isCollapsed,
    onSelectChat,
}) {
    return (
        <button
            type="button"
            onClick={() => onSelectChat(chat.id)}
            className={[
                "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200",
                isActive
                    ? "border-emerald-400/30 bg-emerald-400/12 text-white shadow-[0_16px_32px_-24px_rgba(52,211,153,0.8)]"
                    : "border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06]",
                isCollapsed ? "justify-center px-0" : "",
            ].join(" ")}
            aria-pressed={isActive}
            title={isCollapsed ? chat.title : undefined}
        >
            <div
                className={[
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                    isActive
                        ? "border-emerald-300/30 bg-emerald-300/18 text-emerald-200"
                        : "border-white/10 bg-slate-900/70 text-slate-400 group-hover:text-slate-200",
                ].join(" ")}
            >
                <ChatIcon />
            </div>

            {!isCollapsed ? (
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <p className="chat-display truncate text-sm font-semibold text-inherit">
                            {chat.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-slate-500">
                            {formatTimestamp(chat.updatedAt)}
                        </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                        {chat.preview}
                    </p>
                </div>
            ) : null}
        </button>
    );
});

const Sidebar = memo(function Sidebar({
    chats,
    activeChatId,
    isCollapsed,
    isMobileOpen,
    onCloseMobile,
    onCreateChat,
    onSelectChat,
    onToggleCollapse,
}) {
    return (
        <>
            <button
                type="button"
                aria-label="Close chat sidebar"
                className={[
                    "fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
                    isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
                onClick={onCloseMobile}
            />

            <aside
                className={[
                    "inspect-sidebar fixed inset-y-0 left-0 z-40 flex h-full w-[20rem] flex-col border-r border-white/10 bg-slate-950/85 backdrop-blur-2xl transition-transform duration-300 lg:relative lg:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "lg:w-24" : "lg:w-[20rem]",
                ].join(" ")}
            >
                <div className="inspect-sidebar-header flex items-center justify-between border-b border-white/10 px-4 py-4">
                    {!isCollapsed ? (
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300/80">
                                Workspace
                            </p>
                            <h1 className="chat-display mt-2 text-xl font-semibold text-white">
                                Perplexity Chat
                            </h1>
                        </div>
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-emerald-300">
                            <SparkIcon />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] lg:flex"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <PanelIcon collapsed={isCollapsed} />
                    </button>
                </div>

                <div className="inspect-sidebar-actions border-b border-white/10 px-4 py-4">
                    <button
                        type="button"
                        onClick={onCreateChat}
                        className={[
                            "flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(45,212,191,0.18),rgba(16,185,129,0.16))] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-28px_rgba(45,212,191,0.9)] transition hover:border-emerald-300/35 hover:bg-[linear-gradient(135deg,rgba(45,212,191,0.24),rgba(16,185,129,0.22))]",
                            isCollapsed ? "px-0" : "",
                        ].join(" ")}
                        aria-label="Create a new chat"
                    >
                        <PlusIcon />
                        {!isCollapsed ? <span>New Chat</span> : null}
                    </button>
                </div>

                <div className="inspect-sidebar-chat-list dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
                    {!isCollapsed ? (
                        <div className="mb-3 px-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                                Recent chats
                            </p>
                        </div>
                    ) : null}

                    <div className="inspect-sidebar-chat-items space-y-2">
                        {chats.map((chat) => (
                            <ChatListItem
                                key={chat.id}
                                chat={chat}
                                isActive={chat.id === activeChatId}
                                isCollapsed={isCollapsed}
                                onSelectChat={onSelectChat}
                            />
                        ))}
                    </div>
                </div>

                <div className="inspect-sidebar-footer border-t border-white/10 p-4">
                    <div
                        className={[
                            "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3",
                            isCollapsed ? "justify-center px-0" : "",
                        ].join(" ")}
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(45,212,191,0.24),rgba(34,197,94,0.16))] text-sm font-semibold text-emerald-100">
                            SR
                        </div>
                        {!isCollapsed ? (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">Swarup</p>
                                <p className="truncate text-xs text-slate-400">
                                    Local demo workspace
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </aside>
        </>
    );
});

export default Sidebar;

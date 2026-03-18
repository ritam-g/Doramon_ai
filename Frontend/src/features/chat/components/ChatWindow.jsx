import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function MenuIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
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

function ActionIcon() {
    return (
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
            <path
                d="M7 12h10M12 7l5 5-5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function TypingIndicator() {
    return (
        <div className="message-enter flex w-full justify-start pl-14">
            <div className="flex max-w-3xl gap-3">
                <div className="rounded-[1.6rem] rounded-tl-md border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <span className="typing-dot h-2.5 w-2.5 rounded-full bg-emerald-200/80" />
                        <span className="typing-dot h-2.5 w-2.5 rounded-full bg-emerald-200/80 [animation-delay:160ms]" />
                        <span className="typing-dot h-2.5 w-2.5 rounded-full bg-emerald-200/80 [animation-delay:320ms]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex min-h-full items-center justify-center py-12">
            <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(45,212,191,0.26),rgba(15,23,42,0.92))] text-emerald-100">
                    <SparkIcon />
                </div>
                <h2 className="chat-display mt-5 text-3xl font-semibold text-white">
                    Start a new conversation
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                    Use the composer below to ask a question, draft content, or prototype UI ideas.
                    This dashboard keeps everything in local component state for a clean frontend demo.
                </p>
                <div className="mt-6 grid gap-3 text-left text-sm text-slate-300 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        Ask for a React component breakdown
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        Request debugging steps for an error
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        Generate a launch checklist
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        Draft a content plan with bullet points
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatWindow({ chat, isResponding, onOpenSidebar }) {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [chat?.id, chat?.messages.length, isResponding]);

    return (
        <section className="inspect-chat-window flex min-h-0 flex-1 flex-col">
            <header className="inspect-chat-header sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={onOpenSidebar}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] lg:hidden"
                            aria-label="Open chat sidebar"
                        >
                            <MenuIcon />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(45,212,191,0.2),rgba(15,23,42,0.88))] text-emerald-100">
                            <SparkIcon />
                        </div>

                        <div className="min-w-0">
                            <p className="chat-display truncate text-lg font-semibold text-white sm:text-xl">
                                {chat?.title ?? "Chat Dashboard"}
                            </p>
                            <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">
                                {chat
                                    ? `${chat.messages.length} message${chat.messages.length === 1 ? "" : "s"} in local session`
                                    : "Local AI demo"}
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <div className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                            GPT-style demo
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
                        >
                            <span>Quick actions</span>
                            <ActionIcon />
                        </button>
                    </div>
                </div>
            </header>

            <div className="inspect-chat-scroll-area dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="inspect-chat-messages mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 sm:gap-6">
                    {!chat || !chat.messages.length ? <EmptyState /> : null}

                    {chat?.messages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isGrouped={chat.messages[index - 1]?.role === message.role}
                        />
                    ))}

                    {chat && isResponding ? <TypingIndicator /> : null}
                    <div ref={endOfMessagesRef} />
                </div>
            </div>
        </section>
    );
}

export default ChatWindow;

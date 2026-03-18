import { memo } from "react";

function AssistantAvatar() {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(45,212,191,0.22),rgba(15,23,42,0.8))] text-emerald-100 shadow-[0_18px_32px_-24px_rgba(45,212,191,0.9)]">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path
                    d="M8 9V7a4 4 0 1 1 8 0v2m-8 0h8m-8 0a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                />
                <path
                    d="M10 13h4M12 11v4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                />
            </svg>
        </div>
    );
}

function UserAvatar() {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/10 bg-slate-900/80 text-cyan-100">
            <span className="text-sm font-semibold">You</span>
        </div>
    );
}

function renderInlineMarkdown(content) {
    return content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((segment, index) => {
        if (!segment) {
            return null;
        }

        if (segment.startsWith("`") && segment.endsWith("`")) {
            return (
                <code
                    key={`${segment}-${index}`}
                    className="rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[0.95em] text-emerald-100"
                >
                    {segment.slice(1, -1)}
                </code>
            );
        }

        if (segment.startsWith("**") && segment.endsWith("**")) {
            return (
                <strong key={`${segment}-${index}`} className="font-semibold text-current">
                    {segment.slice(2, -2)}
                </strong>
            );
        }

        return <span key={`${segment}-${index}`}>{segment}</span>;
    });
}

function renderMarkdown(content) {
    const lines = content.trim().split("\n");
    const blocks = [];
    let bulletBuffer = [];

    const flushBullets = () => {
        if (!bulletBuffer.length) {
            return;
        }

        blocks.push(
            <ul key={`list-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7">
                {bulletBuffer.map((item, index) => (
                    <li key={`${item}-${index}`} className="list-disc">
                        {renderInlineMarkdown(item)}
                    </li>
                ))}
            </ul>
        );
        bulletBuffer = [];
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
            flushBullets();
            return;
        }

        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
            bulletBuffer.push(trimmedLine.slice(2).trim());
            return;
        }

        flushBullets();
        blocks.push(
            <p key={`paragraph-${index}`} className="text-sm leading-7 text-inherit">
                {renderInlineMarkdown(trimmedLine)}
            </p>
        );
    });

    flushBullets();
    return blocks;
}

const MessageBubble = memo(function MessageBubble({ message, isGrouped }) {
    const isAssistant = message.role === "assistant";

    return (
        <div
            className={[
                "inspect-message-bubble message-enter flex w-full",
                isAssistant ? "justify-start" : "justify-end",
                isGrouped ? (isAssistant ? "pl-14" : "pr-14") : "",
            ].join(" ")}
        >
            <div className={["flex max-w-3xl gap-3", isAssistant ? "" : "flex-row-reverse"].join(" ")}>
                {!isGrouped ? (isAssistant ? <AssistantAvatar /> : <UserAvatar />) : null}

                <div className={["min-w-0", isAssistant ? "" : "flex flex-col items-end"].join(" ")}>
                    {!isGrouped ? (
                        <p
                            className={[
                                "mb-2 text-[11px] font-semibold uppercase tracking-[0.28em]",
                                isAssistant ? "text-emerald-200/80" : "text-cyan-100/70",
                                isAssistant ? "" : "text-right",
                            ].join(" ")}
                        >
                            {isAssistant ? "Assistant" : "You"}
                        </p>
                    ) : null}

                    <div
                        className={[
                            "rounded-[1.6rem] border px-5 py-4 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.95)]",
                            isAssistant
                                ? "rounded-tl-md border-white/10 bg-white/[0.05] text-slate-200 backdrop-blur-xl"
                                : "rounded-tr-md border-emerald-200/20 bg-[linear-gradient(135deg,rgba(45,212,191,0.98),rgba(16,185,129,0.92))] text-slate-950",
                        ].join(" ")}
                    >
                        <div className="space-y-3 break-words">{renderMarkdown(message.content)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;

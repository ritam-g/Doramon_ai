import { useEffect, useRef } from "react";

function MicIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M12 16a4 4 0 0 0 4-4V8a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4zm0 0v4m-5-4a5 5 0 0 0 10 0"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function SendIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path
                d="M4 12l15-7-4 7 4 7-15-7zm0 0h11"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function ChatInput({ value, onChange, onSubmit, disabled }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }

        textareaRef.current.style.height = "0px";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }, [value]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (disabled) {
            return;
        }

        onSubmit(value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    };

    return (
        <div className="inspect-chat-input sticky bottom-0 z-20 border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.92)_18%,rgba(2,6,23,0.98))] px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
            <div className="mx-auto max-w-5xl">
                {/* this is the form wehn it click the the api call should happen  */}
                <form
                    onSubmit={handleSubmit}
                    className="inspect-chat-input-form overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-[0_30px_70px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl transition focus-within:border-emerald-300/25 focus-within:shadow-[0_32px_90px_-38px_rgba(16,185,129,0.35)]"
                >
                    <div className="px-4 pt-4">
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Send a message..."
                            className="inspect-chat-input-textarea max-h-[200px] min-h-[52px] w-full resize-none border-0 bg-transparent px-1 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500 "
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                        <p className="text-xs text-slate-500">
                            Press <span className="text-slate-300">Enter</span> to send and{" "}
                            <span className="text-slate-300">Shift + Enter</span> for a new line.
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="inspect-chat-input-mic inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-slate-200"
                                aria-label="Voice input placeholder"
                            >
                                <MicIcon />
                            </button>
                            <button
                                type="submit"
                                disabled={disabled}
                                className="inspect-chat-input-send inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(45,212,191,0.98),rgba(16,185,129,0.94))] px-4 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <span className="hidden sm:inline">Send</span>
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </form>

                <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Responses are simulated locally for UI demo purposes.
                </p>
            </div>
        </div>
    );
}

export default ChatInput;

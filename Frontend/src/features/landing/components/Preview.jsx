import React, { useState } from 'react';
import { ChatMessage } from '../../chat/components/ChatMessage';
import {
  landingPreviewContainerClass,
  landingSectionSpacingClass,
} from '../layout';

const Preview = () => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const mockMessages = [
    {
      id: '1',
      role: 'user',
      content: "Explain the main benefits of Doraemon's new intelligence engine integrated in science solutions.",
    },
    {
      id: '2',
      role: 'bot',
      content:
        "Doraemon Intelligence v2.4 introduces a fundamental shift in reasoning through three core pillars:\n\n*   **ParallelContext Processing:** Understanding billion-parameter datasets 6x faster than v2.3.\n*   **Ethereal Intelligence Layer:** Intuitive reasoning that feels natural to the user's creative intent.\n*   **Neural Memory:** Gaining instant recall of technical documentation across multiple sessions.",
    },
  ];

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <section className={`relative ${landingSectionSpacingClass}`}>
      <div className={landingPreviewContainerClass}>
        <div className="glass-panel overflow-hidden rounded-[2.5rem] border border-white/10 shadow-3xl shadow-black">
          {/* The preview card stays content-driven on small screens and uses
              a fixed desktop height only where the split-pane layout needs it. */}
          <div className="flex items-center justify-between border-b border-white/5 bg-zinc-950/60 px-6 py-5 backdrop-blur-md sm:px-8">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/40" />
              <div className="h-3 w-3 rounded-full bg-amber-500/40" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 opacity-70">
              Doraemon v2.4 - LIVE PREVIEW
            </div>
            <div className="h-8 w-8 rounded-lg border border-white/5 bg-white/5" />
          </div>

          <div className="flex flex-col md:h-[600px] md:flex-row">
            <div className="hidden w-64 flex-col gap-6 border-r border-white/5 bg-zinc-950/40 p-6 md:flex">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">History</div>
                <div className="h-10 rounded-xl border border-white/5 bg-white/5" />
                <div className="px-2 text-xs font-bold text-zinc-500">Quantum Physics</div>
                <div className="px-2 text-xs font-bold text-zinc-500">Marketing Strategy</div>
                <div className="px-2 text-xs font-bold text-zinc-500">App Development</div>
              </div>
            </div>

            <div className="hide-scrollbar flex flex-1 flex-col gap-10 overflow-y-auto bg-zinc-950/20 p-6 sm:p-8">
              {mockMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  copiedMessageId={copiedMessageId}
                  onCopy={handleCopy}
                />
              ))}

              <div className="mt-auto pt-8">
                <div className="relative">
                  <div className="glass-panel flex h-16 items-center rounded-2xl border-white/10 px-6 text-sm text-zinc-500">
                    Message Doraemon...
                  </div>
                  <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-black shadow-lg shadow-cyan-400/20">
                    <span className="material-symbols-outlined font-bold">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preview;

import React from 'react';
import { motion } from 'framer-motion';
import { BotIcon } from '../icons';
import { itemMotion } from '../utils/motion';

export function LoadingMessage() {
  return (
    <motion.article
      {...itemMotion}
      className='flex gap-4'
    >
      <div className='shrink-0 pt-1'>
        <BotIcon size='md' />
      </div>
      <div className='max-w-[88%] md:max-w-[70%]'>
        <div className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
          Doraemon
        </div>
        <div className='flex h-12 w-20 items-center justify-center rounded-[28px] rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] shadow-[0_24px_60px_-34px_rgba(2,6,23,1)]'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-teal-400/80 animate-bounce [animation-delay:-0.3s]' />
            <span className='h-2 w-2 rounded-full bg-teal-400/80 animate-bounce [animation-delay:-0.15s]' />
            <span className='h-2 w-2 rounded-full bg-teal-400/80 animate-bounce' />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

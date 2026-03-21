import React from 'react';
import { motion } from 'framer-motion';
import { BotIcon } from '../icons';
import { itemMotion } from '../utils/motion';

export function WelcomeCard() {
  return (
    <motion.article
      {...itemMotion}
      className='flex gap-4'
    >
      <div className='shrink-0 pt-1'>
        <BotIcon size='md' />
      </div>
      <div className='max-w-[88%] md:max-w-[86%]'>
        <div className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
          Doraemon
        </div>
        <div className='rounded-[28px] rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] px-5 py-5 text-[15px] leading-7 text-slate-100 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)] md:px-6'>
          Yaa-hoo! I&apos;m Doraemon 🔔 — your gadget-powered AI friend from the future! Ask me anything — coding, writing, research, ideas, or just about life. I&apos;ve got a pocket full of answers! 🚀
        </div>
      </div>
    </motion.article>
  );
}

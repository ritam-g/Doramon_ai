// Reuse one small motion preset so message cards enter consistently
export const itemMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  transition: { duration: 0.22, ease: 'easeOut' }
}

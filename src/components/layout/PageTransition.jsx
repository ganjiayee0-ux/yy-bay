import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(8px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(12px)' },
};

export default function PageTransition({ screenKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', minHeight: '100vh', position: 'relative', zIndex: 2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

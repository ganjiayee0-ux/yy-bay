import { motion } from 'framer-motion';
import styles from './GlassCard.module.css';

export default function GlassCard({
  children,
  className = '',
  delay = 0,
  floating = true,
  ...props
}) {
  return (
    <motion.div
      className={`${styles.wrapper} ${className}`}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      <div className={`${styles.card} ${floating ? styles.floating : ''}`}>
        <div className={styles.glow} aria-hidden />
        {children}
      </div>
    </motion.div>
  );
}

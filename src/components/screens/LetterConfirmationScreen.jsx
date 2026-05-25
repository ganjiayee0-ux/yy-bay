import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { confirmationContent } from '../../config/content';
import styles from './Screen.module.css';

export default function LetterConfirmationScreen({ onOpen, onLater, onSeeHeart }) {
  const [waiting, setWaiting] = useState(false);

  const handleLater = () => {
    setWaiting(true);
    onLater?.();
  };

  return (
    <section className={styles.screen}>
      <GlassCard delay={0.1}>
        {!waiting ? (
          <>
            <h1 className={styles.title}>{confirmationContent.title}</h1>
            <p className={styles.subtext}>{confirmationContent.subtext}</p>
            <div className={styles.actionsStack}>
              <GlassButton variant="primary" className={styles.buttonFull} onClick={onOpen}>
                {confirmationContent.open}
              </GlassButton>
              <GlassButton variant="secondary" className={styles.buttonFull} onClick={onSeeHeart}>
                {confirmationContent.seeHeart}
              </GlassButton>
              <GlassButton variant="ghost" className={styles.buttonFull} onClick={handleLater}>
                {confirmationContent.later}
              </GlassButton>
            </div>
          </>
        ) : (
          <>
            <motion.p
              className={`${styles.centerText} ${styles.waitingText}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {confirmationContent.waiting}
            </motion.p>
            <motion.div
              className={styles.actionsStack}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassButton variant="primary" className={styles.buttonFull} onClick={onOpen}>
                {confirmationContent.readNow}
              </GlassButton>
            </motion.div>
          </>
        )}
      </GlassCard>
    </section>
  );
}

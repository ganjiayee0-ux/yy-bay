import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import Modal from '../ui/Modal';
import { identityContent } from '../../config/content';
import styles from './Screen.module.css';

export default function IdentityScreen({ onYes, onReject }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  const handleConfirmReject = () => {
    setShowConfirm(false);
    setFadingOut(true);
    setTimeout(() => {
      setShowGoodbye(true);
    }, 1800);
    setTimeout(() => {
      onReject?.();
    }, 4800);
  };

  return (
    <section className={styles.screen}>
      <GlassCard>
        <h1 className={styles.title}>{identityContent.title}</h1>
        <p className={styles.subtext}>{identityContent.subtext}</p>
        <div className={styles.actions}>
          <GlassButton variant="primary" onClick={onYes}>
            {identityContent.yes}
          </GlassButton>
          <GlassButton variant="ghost" onClick={() => setShowConfirm(true)}>
            {identityContent.no}
          </GlassButton>
        </div>
      </GlassCard>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <p className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          {identityContent.confirmNo}
        </p>
        <div className={styles.actions}>
          <GlassButton variant="ghost" onClick={handleConfirmReject}>
            {identityContent.confirmYes}
          </GlassButton>
          <GlassButton variant="primary" onClick={() => setShowConfirm(false)}>
            {identityContent.reconsider}
          </GlassButton>
        </div>
      </Modal>

      <AnimatePresence>
        {fadingOut && (
          <motion.div
            className={styles.fadeBlack}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence>
              {showGoodbye && (
                <motion.p
                  className={styles.centerText}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {identityContent.goodbye}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

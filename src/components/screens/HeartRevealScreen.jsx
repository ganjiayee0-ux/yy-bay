import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeartGatherCanvas from '../effects/HeartGatherCanvas';
import ButterflyHeartCanvas from '../effects/ButterflyHeartCanvas';
import { letterContent } from '../../config/content';
import styles from './HeartRevealScreen.module.css';

/** 进入本页后多久切到蝴蝶爱心（秒） */
const BUTTERFLY_AFTER_SEC = 7;

export default function HeartRevealScreen({ onBack }) {
  const [showButterfly, setShowButterfly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButterfly(true);
    }, BUTTERFLY_AFTER_SEC * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.screen}>
      <div className={styles.gatherLayer}>
        <HeartGatherCanvas />
      </div>

      {showButterfly && (
        <div className={styles.butterflyOverlay}>
          <motion.div
            className={styles.blackout}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
          <ButterflyHeartCanvas />
          <motion.div
            className={styles.butterflyText}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>我真的很爱你</p>
            <p>陈紫艳</p>
          </motion.div>
        </div>
      )}

      <motion.button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, y: 10, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 1.2, delay: 10, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05, x: '-50%' }}
        whileTap={{ scale: 0.96, x: '-50%' }}
      >
        {letterContent.heartReveal.back}
      </motion.button>
    </section>
  );
}

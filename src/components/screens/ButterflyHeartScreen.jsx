import { motion } from 'framer-motion';
import ButterflyHeartCanvas from '../effects/ButterflyHeartCanvas';
import { letterContent } from '../../config/content';
import styles from './ButterflyHeartScreen.module.css';

export default function ButterflyHeartScreen({ onBack }) {
  return (
    <section className={styles.screen}>
      <div className={styles.stage}>
        <motion.div
          className={styles.blackout}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <ButterflyHeartCanvas />
        <motion.div
          className={styles.text}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 8.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>{letterContent.butterflyHeart.lines[0]}</p>
          <p>{letterContent.butterflyHeart.lines[1]}</p>
        </motion.div>

        <motion.button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          initial={{ opacity: 0, y: 10, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          transition={{ duration: 1.2, delay: 11.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.05, x: '-50%' }}
          whileTap={{ scale: 0.96, x: '-50%' }}
        >
          {letterContent.butterflyHeart.back}
        </motion.button>
      </div>
    </section>
  );
}

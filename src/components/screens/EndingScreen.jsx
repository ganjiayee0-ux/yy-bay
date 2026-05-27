import { motion } from 'framer-motion';
import GlassButton from '../ui/GlassButton';
import { letterContent } from '../../config/content';
import styles from './EndingScreen.module.css';

export default function EndingScreen({ onNext }) {
  return (
    <section className={styles.ending}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          className={styles.line}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {letterContent.finalLine}
        </motion.p>
        <motion.div
          className={styles.next}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassButton variant="primary" onClick={onNext}>
            {letterContent.endingNextButton}
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

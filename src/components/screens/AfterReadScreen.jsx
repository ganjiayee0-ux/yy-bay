import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import GlassButton from '../ui/GlassButton';
import { letterContent } from '../../config/content';
import styles from './AfterReadScreen.module.css';

function RevealLine({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.p
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 1.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.p>
  );
}

function getLineClass(index) {
  if (index === 2 || index === 6) return styles.highlight;
  if (index >= 3 && index <= 5) return styles.emphasis;
  return styles.line;
}

export default function AfterReadScreen({ onContinue }) {
  const { lines, continueButton } = letterContent.afterRead;
  const footerRef = useRef(null);
  const footerInView = useInView(footerRef, { once: true, margin: '-5% 0px' });

  return (
    <section className={styles.page}>
      <div className={styles.body}>
        {lines.map((line, index) => (
          <RevealLine key={index} className={getLineClass(index)} delay={index * 0.04}>
            {line}
          </RevealLine>
        ))}

        <div ref={footerRef} className={styles.footer}>
          {footerInView && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassButton variant="primary" onClick={onContinue}>
                {continueButton}
              </GlassButton>
            </motion.div>
          )}
        </div>
      </div>

      <div className={styles.spacer} aria-hidden />
    </section>
  );
}

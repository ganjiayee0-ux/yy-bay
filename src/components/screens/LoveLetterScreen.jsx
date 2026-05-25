import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import GlassButton from '../ui/GlassButton';
import { letterContent } from '../../config/content';
import styles from './LoveLetterScreen.module.css';

function RevealParagraph({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.p
      ref={ref}
      className={styles.paragraph}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
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

export default function LoveLetterScreen({ onReadDone }) {
  const closingRef = useRef(null);
  const closingInView = useInView(closingRef, { once: true, margin: '-5% 0px' });
  const [showReadDone, setShowReadDone] = useState(false);

  useEffect(() => {
    if (!closingInView) return undefined;

    const timer = setTimeout(() => {
      setShowReadDone(true);
    }, 4200);

    return () => clearTimeout(timer);
  }, [closingInView]);

  return (
    <section className={styles.letter}>
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>{letterContent.header}</h1>
      </motion.header>

      <div className={styles.body}>
        {letterContent.paragraphs.map((text, index) => (
          <RevealParagraph key={index} delay={index * 0.04}>
            {text}
          </RevealParagraph>
        ))}

        <div ref={closingRef} className={styles.closing}>
          {letterContent.closing.map((line, index) => (
            <motion.p
              key={index}
              className={styles.closingLine}
              initial={{ opacity: 0, y: 24 }}
              animate={closingInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 1.6,
                delay: 0.6 + index * 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {line}
            </motion.p>
          ))}

          {showReadDone && (
            <motion.div
              className={styles.readDone}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassButton variant="primary" onClick={onReadDone}>
                {letterContent.readDoneButton}
              </GlassButton>
            </motion.div>
          )}
        </div>
      </div>

      <div className={styles.spacer} aria-hidden />
    </section>
  );
}

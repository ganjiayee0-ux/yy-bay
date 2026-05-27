import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './PasscodeInput.module.css';

export default function PasscodeInput({
  value,
  onChange,
  onSubmit,
  error,
  placeholder = '输入暗码',
  maxLength = 20,
}) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSubmit?.();
    }
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={`${styles.field} ${focused ? styles.focused : ''} ${error ? styles.error : ''}`}
        animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          ref={inputRef}
          type="text"
          lang="zh-CN"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`${styles.input} ${styles.inputMasked}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label="Secret passcode"
        />
        <div className={styles.glowLine} aria-hidden />
      </motion.div>

      {error && (
        <motion.p
          className={styles.errorText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

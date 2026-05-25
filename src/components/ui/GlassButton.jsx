import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './GlassButton.module.css';

export default function GlassButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);

    onClick?.(event);
  };

  return (
    <motion.button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      <span className={styles.label}>{children}</span>
    </motion.button>
  );
}

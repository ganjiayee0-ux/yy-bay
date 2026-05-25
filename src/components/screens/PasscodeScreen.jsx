import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import PasscodeInput from '../ui/PasscodeInput';
import { PASSCODE } from '../../config/constants';
import { passcodeContent } from '../../config/content';
import styles from './Screen.module.css';

export default function PasscodeScreen({ onSuccess }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (value.trim() === PASSCODE) {
      setError('');
      onSuccess?.();
      return;
    }

    setError(passcodeContent.error);
    setTimeout(() => setError(''), 2800);
  };

  return (
    <section className={styles.screen}>
      <GlassCard delay={0.1}>
        <h1 className={styles.title}>{passcodeContent.title}</h1>
        <PasscodeInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          error={error}
        />
        <GlassButton variant="primary" onClick={handleSubmit}>
          {passcodeContent.submit}
        </GlassButton>
      </GlassCard>
    </section>
  );
}

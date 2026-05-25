import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Background from './components/layout/Background';
import PageTransition from './components/layout/PageTransition';
import CinematicOverlay from './components/layout/CinematicOverlay';
import MusicToggle from './components/ui/MusicToggle';
import FallingHearts from './components/ui/FallingHearts';
import IdentityScreen from './components/screens/IdentityScreen';
import PasscodeScreen from './components/screens/PasscodeScreen';
import LetterConfirmationScreen from './components/screens/LetterConfirmationScreen';
import LoveLetterScreen from './components/screens/LoveLetterScreen';
import AfterReadScreen from './components/screens/AfterReadScreen';
import EndingScreen from './components/screens/EndingScreen';
import HeartRevealScreen from './components/screens/HeartRevealScreen';
import HeartPulseScreen from './components/screens/HeartPulseScreen';
import { SCREENS } from './config/constants';
import { useAudio } from './hooks/useAudio';
import { useLenis } from './hooks/useLenis';
import './styles/global.css';
import styles from './App.module.css';

export default function App() {
  const [screen, setScreen] = useState(SCREENS.IDENTITY);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const { isPlaying, play, toggle } = useAudio();

  const isLetterFlow =
    screen === SCREENS.LETTER ||
    screen === SCREENS.AFTER_READ ||
    screen === SCREENS.ENDING;

  useLenis(isLetterFlow);

  const showBackground =
    screen !== SCREENS.HEART_REVEAL && screen !== SCREENS.HEART_PULSE;

  const markInteraction = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const handleIdentityYes = () => {
    markInteraction();
    setScreen(SCREENS.PASSCODE);
  };

  const handlePasscodeSuccess = () => {
    setScreen(SCREENS.CONFIRMATION);
  };

  const handleOpenLetter = () => {
    markInteraction();
    setShowReveal(true);
    if (!isPlaying) {
      play();
    }
    setTimeout(() => {
      setScreen(SCREENS.LETTER);
      setShowReveal(false);
    }, 1200);
  };

  const handleSeeHeart = () => {
    markInteraction();
    setShowReveal(true);
    if (!isPlaying) {
      play();
    }
    setTimeout(() => {
      setScreen(SCREENS.HEART_PULSE);
      setShowReveal(false);
    }, 1200);
  };

  const handleReadDone = useCallback(() => {
    setScreen(SCREENS.AFTER_READ);
  }, []);

  const handleAfterReadContinue = useCallback(() => {
    setScreen(SCREENS.ENDING);
  }, []);

  const handleEndingNext = useCallback(() => {
    setScreen(SCREENS.HEART_REVEAL);
  }, []);

  const handleBackToLetter = useCallback(() => {
    setScreen(SCREENS.CONFIRMATION);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.IDENTITY:
        return (
          <IdentityScreen
            onYes={handleIdentityYes}
            onReject={() => setScreen(SCREENS.GOODBYE)}
          />
        );
      case SCREENS.PASSCODE:
        return <PasscodeScreen onSuccess={handlePasscodeSuccess} />;
      case SCREENS.CONFIRMATION:
        return (
          <LetterConfirmationScreen
            onOpen={handleOpenLetter}
            onLater={() => markInteraction()}
            onSeeHeart={handleSeeHeart}
          />
        );
      case SCREENS.LETTER:
        return <LoveLetterScreen onReadDone={handleReadDone} />;
      case SCREENS.AFTER_READ:
        return <AfterReadScreen onContinue={handleAfterReadContinue} />;
      case SCREENS.ENDING:
        return <EndingScreen onNext={handleEndingNext} />;
      case SCREENS.HEART_REVEAL:
        return <HeartRevealScreen onBack={handleBackToLetter} />;
      case SCREENS.HEART_PULSE:
        return <HeartPulseScreen onBackToLetter={handleBackToLetter} />;
      case SCREENS.GOODBYE:
        return null;
      default:
        return null;
    }
  };

  const brightness =
    screen === SCREENS.LETTER ||
    screen === SCREENS.AFTER_READ ||
    screen === SCREENS.ENDING
      ? 1
      : 0;
  const particleIntensity =
    screen === SCREENS.LETTER ||
    screen === SCREENS.AFTER_READ ||
    screen === SCREENS.ENDING
      ? 1.6
      : 1;

  return (
    <div className={styles.app}>
      {showBackground && (
        <Background brightness={brightness} particleIntensity={particleIntensity} />
      )}
      <FallingHearts
        intensity={
          screen === SCREENS.HEART_REVEAL || screen === SCREENS.HEART_PULSE ? 0.35 : 1
        }
        visible={
          screen !== SCREENS.GOODBYE &&
          screen !== SCREENS.HEART_PULSE
        }
      />
      <CinematicOverlay active={showReveal} />

      <AnimatePresence mode="wait">
        <PageTransition screenKey={screen}>{renderScreen()}</PageTransition>
      </AnimatePresence>

      <MusicToggle
        isPlaying={isPlaying}
        onToggle={toggle}
        visible={hasInteracted && screen !== SCREENS.GOODBYE}
      />
    </div>
  );
}

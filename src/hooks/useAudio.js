import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIO } from '../config/constants';

function createAmbientEngine() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const notes = [261.63, 329.63, 392.0, 493.88, 523.25];
  const oscillators = [];

  notes.forEach((frequency, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = frequency;
    gain.gain.value = 0.035 + index * 0.004;
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start();

    oscillators.push({ osc, gain });
  });

  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  return {
    context,
    master,
    stop: () => {
      lfo.stop();
      oscillators.forEach(({ osc }) => osc.stop());
      context.close();
    },
  };
}

export function useAudio() {
  const audioRef = useRef(null);
  const engineRef = useRef(null);
  const fadeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO.src);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleError = () => setUseFallback(true);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audio.pause();
      audio.src = '';
      engineRef.current?.stop();
    };
  }, []);

  const fadeTo = useCallback((targetVolume, duration = AUDIO.fadeDuration) => {
    const audio = audioRef.current;
    const engine = engineRef.current;
    const startVolume = useFallback ? engine?.master.gain.value ?? 0 : audio?.volume ?? 0;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVolume = startVolume + (targetVolume - startVolume) * eased;

      if (useFallback && engine) {
        engine.master.gain.value = nextVolume;
      } else if (audio) {
        audio.volume = nextVolume;
      }

      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step);
      }
    };

    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    fadeRef.current = requestAnimationFrame(step);
  }, [useFallback]);

  const play = useCallback(async () => {
    try {
      if (useFallback) {
        if (!engineRef.current) {
          engineRef.current = createAmbientEngine();
        }
        await engineRef.current?.context.resume();
        setIsPlaying(true);
        fadeTo(AUDIO.targetVolume);
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      await audio.play();
      setIsPlaying(true);
      fadeTo(AUDIO.targetVolume);
    } catch {
      setUseFallback(true);
      if (!engineRef.current) {
        engineRef.current = createAmbientEngine();
      }
      await engineRef.current?.context.resume();
      setIsPlaying(true);
      fadeTo(AUDIO.targetVolume);
    }
  }, [fadeTo, useFallback]);

  const pause = useCallback(() => {
    fadeTo(0, 1500);
    setTimeout(() => {
      if (useFallback) {
        engineRef.current?.stop();
        engineRef.current = null;
      } else {
        audioRef.current?.pause();
      }
      setIsPlaying(false);
    }, 1500);
  }, [fadeTo, useFallback]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return { isPlaying, play, pause, toggle };
}

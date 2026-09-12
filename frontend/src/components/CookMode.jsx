import { useEffect, useRef, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Volume2, VolumeX,
  Play, Pause, RotateCcw, Check, CheckCheck, ChefHat, TimerReset
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { parseDuration, formatDuration } from '../utils/recipeSteps';

let audioCtx;

function beep(freq = 880, dur = 0.18) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    // audio not available
  }
}

const TIME_UP_MESSAGES = [
  'Time is up. Great work continuing the recipe!',
  'Timer finished. Next step!',
  'Your timer is done — keep going, chef!'
];

export default function CookMode({ recipe, onClose }) {
  const { notify } = useToast();
  const steps = Array.isArray(recipe?.steps) && recipe.steps.length ? recipe.steps : ['No steps available for this recipe.'];
  const [idx, setIdx] = useState(0);
  const [autoRead, setAutoRead] = useState(() => localStorage.getItem('cookmode-autoread') !== '0');
  const [timer, setTimer] = useState(null);
  const [stepDone, setStepDone] = useState(false);
  const timerRef = useRef(null);

  const voiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const step = steps[idx];
  const total = steps.length;
  const stepTimerSeconds = step ? parseDuration(step) : null;

  const say = (text, { force = false } = {}) => {
    if (!voiceSupported || (!autoRead && !force)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(text).replace(/(\d+) hours?/g, '$1 hours').replace(/\*\*/g, ''));
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    } catch {
      // speech unavailable
    }
  };

  const goTo = (nextIdx) => {
    const clamped = Math.max(0, Math.min(total - 1, nextIdx));
    setIdx(clamped);
    setStepDone(false);
    say(steps[clamped], { force: true });
  };

  const readNow = () => say(step, { force: true });

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setTimer(null);
  };

  const startTimer = () => {
    if (!stepTimerSeconds) return;
    stopTimer();
    const end = Date.now() + stepTimerSeconds * 1000;
    setTimer({ total: stepTimerSeconds, remaining: stepTimerSeconds });
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setTimer(t => (t ? { ...t, remaining } : t));
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        beep(880, 0.2);
        setTimeout(() => beep(880, 0.2), 250);
        setTimeout(() => beep(660, 0.35), 500);
        const msg = TIME_UP_MESSAGES[Math.floor(Math.random() * TIME_UP_MESSAGES.length)];
        notify('Timer finished ⏱', 'info');
        say(msg, { force: true });
        setTimer(null);
      }
    }, 250);
  };

  const markDoneAndNext = () => {
    if (idx < total - 1) {
      goTo(idx + 1);
    } else {
      notify('Recipe complete — bon appétit! 🍽️', 'success');
      onClose();
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') markDoneAndNext();
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (voiceSupported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = ((idx + 1) / total) * 100;
  const isLast = idx === total - 1;

  const toggleAutoRead = () => {
    const next = !autoRead;
    setAutoRead(next);
    localStorage.setItem('cookmode-autoread', next ? '1' : '0');
  };

  return (
    <div className="cookmode-overlay">
      <div className="cookmode">
        <header className="cookmode-header">
          <div className="cookmode-title">
            <span className="cookmode-icon"><ChefHat size={18} /></span>
            <div>
              <h3>{recipe?.title || 'Cook Mode'}</h3>
              <span className="cookmode-progress-label">Step {idx + 1} of {total}</span>
            </div>
          </div>
          <div className="cookmode-actions">
            {voiceSupported && (
              <button className={`cookmode-voice ${autoRead ? 'active' : ''}`} onClick={toggleAutoRead} title="Auto read steps aloud">
                {autoRead ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            )}
            <button className="cookmode-close" onClick={onClose} aria-label="Close cook mode">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="cookmode-progress"><div className="cookmode-progress-fill" style={{ width: `${progress}%` }} /></div>

        <main className="cookmode-content">
          {stepTimerSeconds !== null && (
            <div className={`cook-timer ${timer ? 'active' : ''}`}>
              <span className="cook-timer-icon"><TimerReset size={15} /></span>
              <span className="cook-timer-text">Timer suggested for this step</span>
              <button
                className="cook-timer-button"
                onClick={timer ? stopTimer : startTimer}
              >
                {timer ? (
                  <>
                    <Pause size={14} /> {formatDuration(timer.remaining)}
                  </>
                ) : (
                  <>
                    <Play size={14} /> Start {formatDuration(stepTimerSeconds)}
                  </>
                )}
              </button>
              {timer && (
                <button className="cook-timer-reset" onClick={stopTimer} aria-label="Reset timer">
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          )}

          <div className="cookmode-step">
            <span className="cookmode-step-badge">{idx + 1}</span>
            <p className="cookmode-step-text">{step}</p>
          </div>

          <button className="cookmode-read" onClick={readNow}>
            <Volume2 size={16} /> Read step
          </button>

          <div className="cookmode-done-row">
            <button
              className={`cookmode-done ${stepDone ? 'complete' : ''}`}
              onClick={() => { setStepDone(true); notify('Step complete', 'success'); }}
            >
              <Check size={15} /> Done
            </button>
          </div>
        </main>

        <nav className="cookmode-footer">
          <button className="cookmode-nav" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft size={18} /> Back
          </button>
          <button className="cookmode-nav cookmode-next" onClick={markDoneAndNext}>
            {isLast ? (<><CheckCheck size={18} /> Finish</>) : (<>Next <ChevronRight size={18} /></>)}
          </button>
        </nav>
      </div>
    </div>
  );
}
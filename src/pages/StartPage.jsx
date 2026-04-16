import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import { useTextToSpeech, preloadPhrases } from '../hooks/useSpeech';
import { Eye, EarOff, Accessibility } from 'lucide-react';

const MODES = [
  { 
    taps: 1, 
    path: '/blind', 
    label: 'Көрмейтіндер режимі', 
    icon: <Eye className="w-8 h-8" />,
    color: 'from-cyan-500/30 to-blue-600/30',
    borderColor: 'border-cyan-400/40'
  },
  { 
    taps: 2, 
    path: '/deaf', 
    label: 'Естімейтіндер режимі',
    icon: <EarOff className="w-8 h-8" />,
    color: 'from-amber-500/30 to-orange-600/30',
    borderColor: 'border-amber-400/40'
  },
  { 
    taps: 3, 
    path: '/mobility', 
    label: 'Көмек режимі',
    icon: <Accessibility className="w-8 h-8" />,
    color: 'from-emerald-500/30 to-green-600/30',
    borderColor: 'border-emerald-400/40'
  },
];

const INSTRUCTION_TEXT = 'Қожа Ахмет Яссауи кесенесінің инклюзивті гидіне қош келдіңіз. Бір рет басыңыз — көрмейтіндер режімі. Екі рет басыңыз — естімейтіндер режімі. Үш рет басыңыз — көмек режімі.';

const PRELOAD = [
  INSTRUCTION_TEXT,
  'Өтінеміз, бір, екі немесе үш рет басыңыз.',
  ...MODES.map(m => `Сіз таңдадыңыз: ${m.label}`),
];

export default function StartPage() {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();
  const [tapCount, setTapCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState(null);
  const [showRipple, setShowRipple] = useState(false);
  const tapTimerRef = useRef(null);
  const instructionTimerRef = useRef(null);
  const lastTouchTimeRef = useRef(0);

  useEffect(() => { preloadPhrases(PRELOAD); }, []);

  const playInstruction = useCallback(() => {
    speak(INSTRUCTION_TEXT);
  }, [speak]);

  // Auto-play instruction when page opens (once per session)
  useEffect(() => {
    if (!sessionStorage.getItem('startpage_played')) {
      sessionStorage.setItem('startpage_played', '1');
      // Small delay for audio context to be ready
      const t = setTimeout(() => playInstruction(), 600);
      return () => clearTimeout(t);
    }
  }, [playInstruction]);

  // Repeat instruction every 15 seconds if no selection
  useEffect(() => {
    instructionTimerRef.current = setInterval(() => {
      if (!selectedMode) {
        playInstruction();
      }
    }, 15000);
    return () => clearInterval(instructionTimerRef.current);
  }, [selectedMode, playInstruction]);

  const handleTap = useCallback(() => {
    if (selectedMode) return;

    setTapCount(prev => {
      const newCount = prev + 1;
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 300);
      return newCount;
    });

    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      setTapCount(current => {
        const mode = MODES.find(m => m.taps === current);
        if (mode) {
          setSelectedMode(mode);
          speak(`Сіз таңдадыңыз: ${mode.label}`);
          setTimeout(() => navigate(mode.path), 4000);
        } else {
          speak('Өтінеміз, бір, екі немесе үш рет басыңыз.');
          return 0;
        }
        return current;
      });
    }, 1200);
  }, [selectedMode, navigate, speak]);

  const handleTouchStart = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
    handleTap();
  }, [handleTap]);

  const handleClick = useCallback(() => {
    // Suppress click if a touch event fired within the last 500ms
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    handleTap();
  }, [handleTap]);

  return (
    <BackgroundLayout overlayOpacity="bg-black/50">
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 select-none cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-heading font-medium text-sm tracking-widest uppercase">
              Инклюзивті гид
            </span>
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-6xl text-white leading-tight">
            Қожа Ахмет
            <br />
            <span className="text-primary">Яссауи</span>
            <br />
            кесенесі
          </h1>
        </motion.div>

        {/* Tap indicator */}
        <AnimatePresence>
          {!selectedMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center mb-10"
            >
              {/* Pulsing circle */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
                <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center">
                  <span className="font-heading font-bold text-4xl text-white">
                    {tapCount || '?'}
                  </span>
                </div>
                {showRipple && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full border-2 border-primary"
                  />
                )}
              </div>
              <p className="text-white/80 text-center text-lg md:text-xl font-body mt-6 max-w-sm leading-relaxed">
                Режимді таңдау үшін экранға басыңыз
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected mode confirmation */}
        <AnimatePresence>
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r ${selectedMode.color} backdrop-blur-xl border ${selectedMode.borderColor}`}>
                <span className="text-white">{selectedMode.icon}</span>
                <span className="font-heading font-bold text-2xl text-white">
                  {selectedMode.label}
                </span>
              </div>
              <p className="text-white/50 mt-4 font-body">Өтуде...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode legend at bottom */}
        {!selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-6 right-6"
          >
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {MODES.map((mode) => (
                <div
                  key={mode.taps}
                  className={`flex flex-col items-center gap-2 px-3 py-6 rounded-xl bg-gradient-to-b ${mode.color} backdrop-blur-xl border ${mode.borderColor}`}
                >
                  <div className="flex gap-1">
                    {Array.from({ length: mode.taps }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    ))}
                  </div>
                  <span className="text-white/90 text-sm md:text-base font-body text-center leading-tight font-medium">
                    {mode.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </BackgroundLayout>
  );
}
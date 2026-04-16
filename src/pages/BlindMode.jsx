import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import { useTextToSpeech, preloadPhrases } from '../hooks/useSpeech';
import { Volume2, Phone, Camera, ArrowLeft } from 'lucide-react';

const AUDIO_GUIDE_SECTIONS = [
  {
    title: "Кіріспе",
    text: "Қожа Ахмет Яссауи кесенесі — Түркістан қаласында орналасқан орта ғасыр сәулетінің асыл туындысы. Ол XIV ғасырдың соңында Темірдің бұйрығымен салынған және ЮНЕСКО-ның Дүниежүзілік мұра тізіміне енгізілген."
  },
  {
    title: "Бас күмбез",
    text: "Кесененің бас күмбезі Орталық Азиядағы ең ірілерінің бірі. Оның диаметрі шамамен он сегіз метр. Күмбез темір дәуірінің сәулетіне тән көгілдір глазурланған кірпішпен қапталған."
  },
  {
    title: "Қазандық",
    text: "Орталық залда ритуалдық су үшін алып қола қазан орналасқан. Оның диаметрі екі метрден асады, ал салмағы шамамен екі тонна. Қазан араб жазулары мен өсімдік өрнектерімен безендірілген."
  },
  {
    title: "Яссауи зираты",
    text: "Қожа Ахмет Яссауи зираты жеке бөлмеде орналасқан. Қабір тасы сұр-жасыл тастан жасалған және ою-өрнектермен безендірілген. Яссауи XII ғасырдың ұлы сопылық ақыны және ойшылы болды."
  },
  {
    title: "Ішкі безендіру",
    text: "Кесене қабырғалары мозаика және тас ою-өрнектермен безендірілген. Геометриялық өрнектер мен каллиграфиялық жазулар бірегей атмосфера жасайды. Безендіру элементтерінің көпшілігі алты жүз жылдан астам уақыт бойы сақталған."
  },
];

const INSTRUCTION = "Көрмейтіндер режімі. Бір рет басыңыз — артқа. Екі рет — менеджермен байланыс. Үш рет — камераны ашу. Төрт рет — аудио гид.";

const PRELOAD = [
  INSTRUCTION,
  'Аудио гид аяқталды. Бір рет басыңыз — артқа.',
  'Аудио гид тоқтатылды.',
  'Артқа оралуда',
  'Менеджерге қоңырау шалынуда',
  'Камера ашылуда',
  'Аудио гид басталуда.',
  ...AUDIO_GUIDE_SECTIONS.map(s => `${s.title}. ${s.text}`),
];

const COMMANDS = [
  { taps: 1, label: 'Артқа', icon: <ArrowLeft className="w-6 h-6" />, color: 'text-white/70' },
  { taps: 2, label: 'Менеджермен байланыс', icon: <Phone className="w-6 h-6" />, color: 'text-primary' },
  { taps: 3, label: 'Камераны ашу', icon: <Camera className="w-6 h-6" />, color: 'text-cyan-400' },
  { taps: 4, label: 'Аудио гид', icon: <Volume2 className="w-6 h-6" />, color: 'text-emerald-400' },
];

export default function BlindMode() {
  const navigate = useNavigate();
  const { speak, stop } = useTextToSpeech();
  const [isAudioGuideActive, setIsAudioGuideActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastTouchTimeRef = useRef(0);
  const audioGuideActiveRef = useRef(false);

  useEffect(() => { preloadPhrases(PRELOAD); }, []);

  useEffect(() => {
    if (!hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => speak(INSTRUCTION), 500);
    }
  }, [speak]);

  const playAudioGuide = useCallback((index = 0) => {
    if (index >= AUDIO_GUIDE_SECTIONS.length) {
      audioGuideActiveRef.current = false;
      setIsAudioGuideActive(false);
      speak('Аудио гид аяқталды. Бір рет басыңыз — артқа.');
      return;
    }
    const section = AUDIO_GUIDE_SECTIONS[index];
    speak(`${section.title}. ${section.text}`, () => {
      if (audioGuideActiveRef.current) {
        setTimeout(() => playAudioGuide(index + 1), 500);
      }
    });
  }, [speak]);

  const registerTap = useCallback(() => {
    // While audio guide is active — any tap stops it
    if (audioGuideActiveRef.current) {
      stop();
      audioGuideActiveRef.current = false;
      setIsAudioGuideActive(false);
      speak('Аудио гид тоқтатылды.');
      return;
    }
    setTapCount(prev => prev + 1);
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      setTapCount(current => {
        if (current === 1) {
          stop(); speak('Артқа оралуда'); setTimeout(() => navigate('/'), 1500);
        } else if (current === 2) {
          stop(); speak('Менеджерге қоңырау шалынуда');
          setTimeout(() => { window.location.href = 'tel:+77754514282'; }, 1000);
        } else if (current === 3) {
          stop(); speak('Камера ашылуда'); setTimeout(() => navigate('/camera'), 1500);
        } else if (current === 4) {
          stop();
          audioGuideActiveRef.current = true;
          setIsAudioGuideActive(true);
          speak('Аудио гид басталуда.', () => playAudioGuide(0));
        }
        return 0;
      });
    }, 1000);
  }, [navigate, speak, stop, playAudioGuide]);

  const handleTouchStart = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
    registerTap();
  }, [registerTap]);

  const handleClick = useCallback(() => {
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    registerTap();
  }, [registerTap]);



  return (
    <BackgroundLayout overlayOpacity="bg-black/50">
      <div
        className="flex-1 flex flex-col"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 pb-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">Көрмейтіндер режимі</h1>
              <p className="text-white/50 text-sm font-body">Түрту арқылы басқару</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          key="commands"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col justify-center px-5 gap-3"
        >
          {COMMANDS.map((cmd, idx) => (
            <motion.div
              key={cmd.taps}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <div className="flex gap-1 shrink-0">
                {Array.from({ length: cmd.taps }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-white/40" />
                ))}
              </div>
              <span className={`${cmd.color} shrink-0`}>{cmd.icon}</span>
              <span className="text-white font-body text-xl font-semibold">{cmd.label}</span>
            </motion.div>
          ))}

          {isAudioGuideActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/30"
            >
              <Volume2 className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-primary font-body">Аудио гид ойнатылуда...</p>
              <p className="text-white/40 text-sm mt-1">Тоқтату үшін бір рет басыңыз</p>
            </motion.div>
          )}

          {tapCount > 0 && !isAudioGuideActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-2"
            >
              <span className="text-primary text-5xl font-heading font-bold">{tapCount}</span>
              <p className="text-white/40 text-sm font-body mt-1">Басу</p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom tap legend */}
        {(
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 pt-2"
          >
            <p className="text-white/30 text-center text-sm font-body">Қажетті рет санын экранға басыңыз</p>
          </motion.div>
        )}
      </div>
    </BackgroundLayout>
  );
}
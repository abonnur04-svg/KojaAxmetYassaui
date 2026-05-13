import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import { useTextToSpeech } from '../hooks/useSpeech';
import { Volume2, Phone, Camera, ArrowLeft, Pause, Play } from 'lucide-react';

const AUDIO_GUIDE_SECTIONS = [
  {
    title: "Введение",
    text: "Мавзолей Ходжи Ахмеда Яссауи — выдающийся памятник средневековой архитектуры, расположенный в городе Туркестан. Он был построен по приказу Тимура в конце четырнадцатого века и является объектом Всемирного наследия ЮНЕСКО."
  },
  {
    title: "Главный купол",
    text: "Главный купол мавзолея является одним из крупнейших в Центральной Азии. Его диаметр составляет около восемнадцати метров. Купол покрыт бирюзовой глазурованной плиткой, характерной для тимуридской архитектуры."
  },
  {
    title: "Казандык",
    text: "В центральном зале расположен огромный бронзовый казан — ритуальный сосуд для воды. Его диаметр превышает два метра, а вес составляет около двух тонн. Казан украшен арабскими надписями и растительным орнаментом."
  },
  {
    title: "Усыпальница",
    text: "Усыпальница Ходжи Ахмеда Яссауи расположена в отдельном помещении. Надгробие выполнено из серо-зелёного камня и украшено резными узорами. Яссауи был великим суфийским поэтом и мыслителем двенадцатого века."
  },
  {
    title: "Внутреннее убранство",
    text: "Стены мавзолея украшены мозаикой и резьбой по камню. Геометрические узоры и каллиграфические надписи создают уникальную атмосферу. Многие элементы декора сохранились в первозданном виде более шестисот лет."
  },
];

const INSTRUCTION = "Режим для незрячих. Бір рет басыңыз — артқа қайту. Екі рет басыңыз — менеджерге қоңырау шалу. Үш рет басыңыз — камераны ашу. Төрт рет басыңыз — аудио гидті ашу.";

const COMMANDS = [
  { taps: 1, label: 'Назад', icon: <ArrowLeft className="w-6 h-6" />, color: 'text-white/70' },
  { taps: 2, label: 'Связь с менеджером', icon: <Phone className="w-6 h-6" />, color: 'text-primary' },
  { taps: 3, label: 'Открыть камеру', icon: <Camera className="w-6 h-6" />, color: 'text-amber-400' },
  { taps: 4, label: 'Аудиогид', icon: <Volume2 className="w-6 h-6" />, color: 'text-emerald-400' },
];

export default function BlindMode() {
  const navigate = useNavigate();
  const { speak, stop, isPlaying: ttsPlaying } = useTextToSpeech();
  const [showAudioGuide, setShowAudioGuide] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastTouchTimeRef = useRef(0);

  // Sync local isPlaying with TTS state
  useEffect(() => {
    if (!ttsPlaying && isPlaying) {
      setIsPlaying(false);
    }
  }, [ttsPlaying, isPlaying]);

  useEffect(() => {
    if (!hasSpokenRef.current) {
      hasSpokenRef.current = true;
      setTimeout(() => speak(INSTRUCTION), 500);
    }
  }, [speak]);

  const registerTap = useCallback(() => {
    if (showAudioGuide) return;
    setTapCount(prev => prev + 1);
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      setTapCount(current => {
        if (current === 1) {
          stop(); speak('Артқа қайту'); setTimeout(() => navigate('/'), 1500);
        } else if (current === 2) {
          stop(); speak('Менеджерге қоңырау шалу'); setTimeout(() => navigate('/contact'), 1500);
        } else if (current === 3) {
          stop(); speak('Камераны ашу'); setTimeout(() => navigate('/camera'), 1500);
        } else if (current === 4) {
          stop(); speak('Аудио гидті ашу'); setTimeout(() => setShowAudioGuide(true), 800);
        }
        return 0;
      });
    }, 1000);
  }, [navigate, speak, stop, showAudioGuide]);

  const handleTouchStart = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
    registerTap();
  }, [registerTap]);

  const handleClick = useCallback(() => {
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    registerTap();
  }, [registerTap]);

  const playSection = useCallback((index) => {
    stop();
    setCurrentSection(index);
    setIsPlaying(true);
    const section = AUDIO_GUIDE_SECTIONS[index];
    speak(`${section.title}. ${section.text}`);
  }, [speak, stop]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      playSection(currentSection);
    }
  }, [isPlaying, currentSection, playSection, stop]);

  const nextSection = useCallback(() => {
    const next = Math.min(currentSection + 1, AUDIO_GUIDE_SECTIONS.length - 1);
    playSection(next);
  }, [currentSection, playSection]);

  const prevSection = useCallback(() => {
    const prev = Math.max(currentSection - 1, 0);
    playSection(prev);
  }, [currentSection, playSection]);

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
              <h1 className="font-heading font-bold text-2xl text-white">Режим для незрячих</h1>
              <p className="text-white/50 text-sm font-body">Управление касаниями</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showAudioGuide ? (
            /* Commands screen */
            <motion.div
              key="commands"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

              {tapCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-2"
                >
                  <span className="text-primary text-5xl font-heading font-bold">{tapCount}</span>
                  <p className="text-white/40 text-sm font-body mt-1">касани{tapCount === 1 ? 'е' : 'я'}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Audio guide */
            <motion.div
              key="audioguid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center px-5 gap-4"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary text-sm font-heading font-medium">
                    {currentSection + 1} / {AUDIO_GUIDE_SECTIONS.length}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); stop(); setShowAudioGuide(false); }}
                    onTouchStart={(e) => { e.stopPropagation(); stop(); setShowAudioGuide(false); }}
                    className="text-white/40 text-sm hover:text-white/70 transition"
                  >
                    ✕ Закрыть
                  </button>
                </div>
                <h2 className="font-heading font-bold text-3xl text-white mb-3">
                  {AUDIO_GUIDE_SECTIONS[currentSection].title}
                </h2>
                <p className="text-white/70 text-lg font-body leading-relaxed">
                  {AUDIO_GUIDE_SECTIONS[currentSection].text}
                </p>
                <div
                  className="flex items-center justify-center gap-6 mt-6"
                  onClick={e => e.stopPropagation()}
                  onTouchStart={e => e.stopPropagation()}
                >
                  <button
                    onClick={prevSection}
                    className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="rounded-full bg-primary/90 border border-primary/50 flex items-center justify-center text-primary-foreground hover:bg-primary transition shadow-lg shadow-primary/20"
                    style={{ width: 72, height: 72 }}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                  <button
                    onClick={nextSection}
                    className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
                  >
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom tap legend */}
        {!showAudioGuide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 pt-2"
          >
            <p className="text-white/30 text-center text-sm font-body">Коснитесь экрана нужное количество раз</p>
          </motion.div>
        )}
      </div>
    </BackgroundLayout>
  );
}
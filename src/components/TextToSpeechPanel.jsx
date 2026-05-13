import { useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundLayout from './BackgroundLayout';
import PageHeader from './PageHeader';
import { useTextToSpeech } from '../hooks/useSpeech';
import { Volume2 } from 'lucide-react';

const QUICK_PHRASES = [
  "Где находится туалет?",
  "Куда мне пройти?",
  "Где выход?",
  "Позовите менеджера.",
  "Мне нужна помощь.",
  "Спасибо!",
  "Подождите, пожалуйста.",
  "Я вас не понимаю.",
];

export default function TextToSpeechPanel({ onBack }) {
  const { speak } = useTextToSpeech();
  const [customText, setCustomText] = useState('');

  return (
    <BackgroundLayout overlayOpacity="bg-black/80">
      <PageHeader title="Текст в речь" subtitle="Наберите или выберите фразу" onBack={onBack} />

      <div className="flex-1 flex flex-col px-5 pb-5 gap-4 overflow-auto">
        {/* Custom text input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Введите фразу..."
            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-4 text-white text-lg font-body placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => { if (customText.trim()) speak(customText); }}
            className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Quick phrases */}
        <p className="text-white/40 text-sm font-body px-1">Быстрые фразы:</p>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_PHRASES.map((phrase, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => speak(phrase)}
              className="w-full text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 text-white text-lg font-body hover:bg-white/15 transition-colors flex items-center gap-3"
            >
              <Volume2 className="w-5 h-5 text-primary shrink-0" />
              {phrase}
            </motion.button>
          ))}
        </div>
      </div>
    </BackgroundLayout>
  );
}
import { motion } from 'framer-motion';
import BackgroundLayout from './BackgroundLayout';
import PageHeader from './PageHeader';
import { useSpeechToText } from '../hooks/useSpeech';
import { Mic, MicOff, Trash2 } from 'lucide-react';

export default function SpeechToTextPanel({ onBack }) {
  const { transcript, isListening, startListening, stopListening, clearTranscript } = useSpeechToText();

  return (
    <BackgroundLayout overlayOpacity="bg-black/80">
      <PageHeader title="Сөйлеуді мәтінге" subtitle="Тыңдап, мәтінге айналдырамыз" onBack={onBack} />

      <div className="flex-1 flex flex-col px-5 pb-5 gap-4">
        {/* Transcript area */}
        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 overflow-auto">
          {transcript ? (
            <p className="text-white text-xl md:text-2xl font-body leading-relaxed">
              {transcript}
            </p>
          ) : (
            <p className="text-white/30 text-xl font-body text-center mt-10">
              {isListening ? 'Сөйлеңіз, мәтін осында пайда болады...' : 'Бастау үшін микрофон түймесіне басыңыз'}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {transcript && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearTranscript}
              className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 transition"
            >
              <Trash2 className="w-6 h-6" />
            </motion.button>
          )}
          <button
            onClick={isListening ? stopListening : () => startListening('ru-RU')}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening 
                ? 'bg-red-500 shadow-red-500/30 animate-pulse' 
                : 'bg-primary shadow-primary/30'
            }`}
          >
            {isListening 
              ? <MicOff className="w-8 h-8 text-white" /> 
              : <Mic className="w-8 h-8 text-primary-foreground" />
            }
          </button>
        </div>
      </div>
    </BackgroundLayout>
  );
}
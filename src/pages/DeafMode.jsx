import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import PageHeader from '../components/PageHeader';
import AccessibleButton from '../components/AccessibleButton';
import { Mic, Volume2, BookOpen, Phone, Map, Images } from 'lucide-react';
import SpeechToTextPanel from '../components/SpeechToTextPanel';
import TextToSpeechPanel from '../components/TextToSpeechPanel';
import TextGuidePanel from '../components/TextGuidePanel';

export default function DeafMode() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);

  if (activePanel === 'stt') {
    return <SpeechToTextPanel onBack={() => setActivePanel(null)} />;
  }
  if (activePanel === 'tts') {
    return <TextToSpeechPanel onBack={() => setActivePanel(null)} />;
  }
  if (activePanel === 'guide') {
    return <TextGuidePanel onBack={() => setActivePanel(null)} />;
  }

  return (
    <BackgroundLayout overlayOpacity="bg-black/70">
      <PageHeader 
        title="Естімейтіндер режимі" 
        subtitle="Мәтіндік сүйемелдеу және байланыс"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-3 px-5 py-4 max-w-lg mx-auto w-full"
      >
        <AccessibleButton
          icon={<BookOpen className="w-7 h-7 text-amber-400" />}
          label="Мәтіндік гид"
          sublabel="Кесене туралы ақпаратты оқыңыз"
          onClick={() => setActivePanel('guide')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Mic className="w-7 h-7 text-cyan-400" />}
          label="Сөйлеуді мәтінге"
          sublabel="Гидтің сөзін мәтінге айналдырыңыз"
          onClick={() => setActivePanel('stt')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Volume2 className="w-7 h-7 text-emerald-400" />}
          label="Мәтінді сөйлеуге"
          sublabel="Фразаңызды дауыстаңыз"
          onClick={() => setActivePanel('tts')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Images className="w-7 h-7 text-violet-400" />}
          label="Галерея"
          sublabel="Кесенеге байланысты фотосуреттер"
          onClick={() => navigate('/gallery')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Map className="w-7 h-7 text-rose-400" />}
          label="Кесене картасы"
          sublabel="Негізгі нысандар мен жол"
          onClick={() => navigate('/map')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Phone className="w-7 h-7 text-primary" />}
          label="Менеджермен байланысу"
          sublabel="Telegram, WhatsApp, қоңырау"
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />
      </motion.div>
    </BackgroundLayout>
  );
}
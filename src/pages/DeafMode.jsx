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
import { useLang } from '../lib/LangContext';
import { TEXTS } from '../lib/i18n';

export default function DeafMode() {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const { lang } = useLang();
  const t = TEXTS[lang];

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
        title={t.deafModeTitle} 
        subtitle={t.deafModeSubtitle}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-3 px-5 py-4 max-w-lg mx-auto w-full"
      >
        <AccessibleButton
          icon={<BookOpen className="w-7 h-7 text-amber-400" />}
          label={t.textGuide}
          sublabel={t.textGuideSub}
          onClick={() => setActivePanel('guide')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Mic className="w-7 h-7 text-cyan-400" />}
          label={t.speechToText}
          sublabel={t.speechToTextSub}
          onClick={() => setActivePanel('stt')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Volume2 className="w-7 h-7 text-emerald-400" />}
          label={t.textToSpeech}
          sublabel={t.textToSpeechSub}
          onClick={() => setActivePanel('tts')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Images className="w-7 h-7 text-violet-400" />}
          label={t.gallery}
          sublabel={t.gallerySub}
          onClick={() => navigate('/gallery')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Map className="w-7 h-7 text-rose-400" />}
          label={t.mausoleumMap}
          sublabel={t.mausoleumMapSub}
          onClick={() => navigate('/map')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<Phone className="w-7 h-7 text-primary" />}
          label={t.contactManagerBtn}
          sublabel={t.contactManagerSub}
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />
      </motion.div>
    </BackgroundLayout>
  );
}
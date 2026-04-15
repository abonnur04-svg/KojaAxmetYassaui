import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import PageHeader from '../components/PageHeader';
import AccessibleButton from '../components/AccessibleButton';
import { Phone, HandHelping, UserCheck, LogOut, Info, Map, Images } from 'lucide-react';

const TIPS = [
  "Пандус бас кіреберіштің сол жағында орналасқан.",
  "Қозғалысы шектеулі келушілерге арналған дәретхана бірінші қабатта.",
  "Қажет болса менеджерден серіктес тағайындауды сұраңыз.",
  "Барлық негізгі залдар бірінші қабатта қол жетімді.",
];

export default function MobilityMode() {
  const navigate = useNavigate();

  return (
    <BackgroundLayout overlayOpacity="bg-black/70">
      <PageHeader 
        title="Көмек және сүйемелдеу" 
        subtitle="Қозғалысы шектеулі адамдарға арналған режим"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-3 px-5 py-4 max-w-lg mx-auto w-full overflow-auto"
      >
        <AccessibleButton
          icon={<Phone className="w-7 h-7 text-primary" />}
          label="Менеджермен байланысу"
          sublabel="Telegram, WhatsApp, қоңырау"
          onClick={() => navigate('/contact')}
          variant="primary"
          size="xl"
        />

        <AccessibleButton
          icon={<HandHelping className="w-7 h-7 text-amber-400" />}
          label="Жүруге көмек қажет"
          sublabel="Қызметкер көмегін сұрау"
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<UserCheck className="w-7 h-7 text-emerald-400" />}
          label="Серіктес қажет"
          sublabel="Гид немесе волонтер сұрау"
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<LogOut className="w-7 h-7 text-orange-400" />}
          label="Шығуда көмек қажет"
          sublabel="Шығысқа қызметкер шақыру"
          onClick={() => navigate('/contact')}
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
          icon={<Map className="w-7 h-7 text-cyan-400" />}
          label="Интерактивті карта"
          sublabel="Нысандар мен навигация"
          onClick={() => navigate('/map')}
          variant="glass"
          size="xl"
        />

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold text-white">Пайдалы ақпарат</span>
          </div>
          <ul className="space-y-2">
            {TIPS.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-white/70 font-body text-base">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </BackgroundLayout>
  );
}
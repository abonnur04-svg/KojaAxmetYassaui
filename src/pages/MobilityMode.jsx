import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import PageHeader from '../components/PageHeader';
import AccessibleButton from '../components/AccessibleButton';
import { Phone, HandHelping, UserCheck, LogOut, Info, Map, Images } from 'lucide-react';
import { useLang } from '../lib/LangContext';
import { TEXTS } from '../lib/i18n';

export default function MobilityMode() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = TEXTS[lang];

  return (
    <BackgroundLayout overlayOpacity="bg-black/70">
      <PageHeader 
        title={t.mobilityTitle} 
        subtitle={t.mobilitySubtitle}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-3 px-5 py-4 max-w-lg mx-auto w-full overflow-auto"
      >
        <AccessibleButton
          icon={<Phone className="w-7 h-7 text-primary" />}
          label={t.contactManagerBtn}
          sublabel={t.contactManagerSub}
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<HandHelping className="w-7 h-7 text-amber-400" />}
          label={t.needWalkHelp}
          sublabel={t.needWalkHelpSub}
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<UserCheck className="w-7 h-7 text-emerald-400" />}
          label={t.needCompanion}
          sublabel={t.needCompanionSub}
          onClick={() => navigate('/contact')}
          variant="glass"
          size="xl"
        />

        <AccessibleButton
          icon={<LogOut className="w-7 h-7 text-orange-400" />}
          label={t.needExitHelp}
          sublabel={t.needExitHelpSub}
          onClick={() => navigate('/contact')}
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
          icon={<Map className="w-7 h-7 text-cyan-400" />}
          label={t.interactiveMap}
          sublabel={t.interactiveMapSub}
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
            <span className="font-heading font-semibold text-white">{t.usefulInfo}</span>
          </div>
          <ul className="space-y-2">
            {t.tips.map((tip, idx) => (
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
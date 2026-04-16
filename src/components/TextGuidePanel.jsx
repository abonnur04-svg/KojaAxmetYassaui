import { motion } from 'framer-motion';
import BackgroundLayout from './BackgroundLayout';
import PageHeader from './PageHeader';
import { useLang } from '../lib/LangContext';
import { TEXTS } from '../lib/i18n';

export default function TextGuidePanel({ onBack }) {
  const { lang } = useLang();
  const t = TEXTS[lang];
  const GUIDE_SECTIONS = t.guideSections;

  return (
    <BackgroundLayout overlayOpacity="bg-black/80">
      <PageHeader title={t.textGuideTitle} subtitle={t.textGuideSubtitle} onBack={onBack} />

      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          {GUIDE_SECTIONS.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm">
                  {idx + 1}
                </span>
                <h3 className="font-heading font-bold text-xl text-white">{section.title}</h3>
              </div>
              <p className="text-white/70 text-lg font-body leading-relaxed">
                {section.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </BackgroundLayout>
  );
}
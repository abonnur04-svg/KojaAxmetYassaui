import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundLayout from '../components/BackgroundLayout';
import PageHeader from '../components/PageHeader';
import AccessibleButton from '../components/AccessibleButton';
import { Phone, MessageCircle, Send } from 'lucide-react';
import { useLang } from '../lib/LangContext';
import { TEXTS } from '../lib/i18n';

const PHONE_NUMBER = "+7 775 451 4282";
const MSG = encodeURIComponent('Сәлеметсіз бе! Маған кесенеде көмек керек.');
const CONTACTS = [
  { name: 'Айжан', phone: '87011004688' },
  { name: 'Меруерт', phone: '87073968006' },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = TEXTS[lang];

  return (
    <BackgroundLayout overlayOpacity="bg-black/75">
      <PageHeader 
        title={t.contactTitle} 
        subtitle={t.contactSubtitle}
        onBack={() => navigate(-1)}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col gap-4 px-5 py-6 max-w-lg mx-auto w-full"
      >
        {/* Phone */}
        <a href={`tel:${PHONE_NUMBER}`} className="block">
          <AccessibleButton
            icon={<Phone className="w-7 h-7 text-emerald-400" />}
            label={t.callBtn}
            sublabel={PHONE_NUMBER}
            variant="glass"
            size="xl"
          />
        </a>

        {/* Telegram */}
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-sm font-body px-1">Telegram</p>
          {CONTACTS.map(c => (
            <a key={c.phone} href={`https://t.me/+${c.phone}`} target="_blank" rel="noopener noreferrer" className="block">
              <AccessibleButton
                icon={<Send className="w-7 h-7 text-blue-400" />}
                label={c.name}
                sublabel={c.phone}
                variant="glass"
                size="xl"
              />
            </a>
          ))}
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-sm font-body px-1">WhatsApp</p>
          {CONTACTS.map(c => (
            <a key={c.phone} href={`https://wa.me/${c.phone}?text=${MSG}`} target="_blank" rel="noopener noreferrer" className="block">
              <AccessibleButton
                icon={<MessageCircle className="w-7 h-7 text-green-400" />}
                label={c.name}
                sublabel={c.phone}
                variant="glass"
                size="xl"
              />
            </a>
          ))}
        </div>

        {/* Info block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5"
        >
          <p className="text-white/60 font-body text-base leading-relaxed">
            {t.contactInfo}
          </p>
        </motion.div>
      </motion.div>
    </BackgroundLayout>
  );
}
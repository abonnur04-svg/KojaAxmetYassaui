import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import BackgroundLayout from '../components/BackgroundLayout';
import { GALLERY_ITEMS } from './GalleryPage';
import { useLang } from '../lib/LangContext';
import { TEXTS } from '../lib/i18n';

export default function GalleryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = TEXTS[lang];
  const item = GALLERY_ITEMS.find((i) => i.id === Number(id));

  if (!item) {
    return (
      <BackgroundLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60">{t.imageNotFound}</p>
        </div>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout overlayOpacity="bg-black/80">
      <div className="flex flex-col flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white/10 border border-white/15 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-white text-lg leading-tight">{item.title}</h1>
            <p className="text-white/50 text-sm">{item.category}</p>
          </div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 rounded-2xl overflow-hidden border border-white/10"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover max-h-72"
          />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-4 mt-4 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
        >
          <p className="text-primary font-body text-sm font-medium mb-1">{item.subtitle}</p>
          <p className="text-white font-body text-base leading-relaxed">{item.description}</p>
        </motion.div>
      </div>
    </BackgroundLayout>
  );
}

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, onBack }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-5 pb-3"
    >
      <button
        onClick={onBack || (() => navigate(-1))}
        className="mt-1 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0"
        aria-label="Назад"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-sm md:text-base mt-1 font-body">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
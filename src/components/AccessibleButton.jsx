import { motion } from 'framer-motion';

export default function AccessibleButton({ 
  icon, 
  label, 
  sublabel,
  onClick, 
  variant = "default",
  size = "lg",
  className = "" 
}) {
  const variants = {
    default: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20",
    primary: "bg-primary/90 backdrop-blur-xl border border-primary/40 text-primary-foreground hover:bg-primary",
    accent: "bg-accent/90 backdrop-blur-xl border border-accent/40 text-accent-foreground hover:bg-accent",
    danger: "bg-red-600/90 backdrop-blur-xl border border-red-500/40 text-white hover:bg-red-600",
    glass: "bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/15",
  };

  const sizes = {
    sm: "px-4 py-3 text-base min-h-[48px]",
    md: "px-5 py-4 text-lg min-h-[56px]",
    lg: "px-6 py-5 text-xl min-h-[72px]",
    xl: "px-8 py-6 text-2xl min-h-[88px]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        w-full rounded-2xl font-body font-semibold
        flex items-center gap-4 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {icon && <span className="text-2xl shrink-0">{icon}</span>}
      <div className="flex flex-col items-start text-left">
        <span className="leading-tight">{label}</span>
        {sublabel && (
          <span className="text-sm font-normal opacity-70 mt-0.5">{sublabel}</span>
        )}
      </div>
    </motion.button>
  );
}
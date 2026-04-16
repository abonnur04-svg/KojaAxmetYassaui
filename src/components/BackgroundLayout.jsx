import { useLang } from '../lib/LangContext';

const BG_IMAGE = "https://media.base44.com/images/public/69d21c4242b48b94ff5afa5f/2455fd508_generated_image.png";

export default function BackgroundLayout({ children, overlayOpacity = "bg-black/60" }) {
  const { lang, setLang } = useLang();

  return (
    <div className="fixed inset-0 overflow-auto">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className={`fixed inset-0 ${overlayOpacity}`} />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Language switcher */}
        <div className="absolute top-3 right-3 z-50">
          <button
            onClick={() => setLang(lang === 'kk' ? 'ru' : 'kk')}
            className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-heading font-semibold hover:bg-white/20 transition-colors"
          >
            {lang === 'kk' ? 'RU' : 'KK'}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
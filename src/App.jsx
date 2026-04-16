import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useEffect } from 'react';
import { preloadPhrases } from './hooks/useSpeech';
import StartPage from './pages/StartPage';
import BlindMode from './pages/BlindMode';
import DeafMode from './pages/DeafMode';
import MobilityMode from './pages/MobilityMode';
import CameraRecognition from './pages/CameraRecognition';
import ContactPage from './pages/ContactPage';
import MapPage from './pages/MapPage';
import GalleryPage from './pages/GalleryPage';
import GalleryDetailPage from './pages/GalleryDetailPage';

const API_URL = import.meta.env.VITE_API_URL || '';

// All static phrases — preload once on app start
const ALL_PHRASES = [
  'Қожа Ахмет Яссауи кесенесінің инклюзивті гидіне қош келдіңіз. Бір рет басыңыз — көрмейтіндер режімі. Екі рет басыңыз — естімейтіндер режімі. Үш рет басыңыз — көмек режімі.',
  'Сіз таңдадыңыз: Көрмейтіндер режимі',
  'Сіз таңдадыңыз: Естімейтіндер режимі',
  'Сіз таңдадыңыз: Көмек режимі',
  'Өтінеміз, бір, екі немесе үш рет басыңыз.',
  'Көрмейтіндер режімі. Бір рет басыңыз — артқа. Екі рет — менеджермен байланыс. Үш рет — камераны ашу. Төрт рет — аудио гид.',
  'Артқа оралуда',
  'Менеджерге қоңырау шалынуда',
  'Камера ашылуда',
  'Аудио гид басталуда.',
  'Аудио гид аяқталды. Бір рет басыңыз — артқа.',
  'Аудио гид тоқтатылды.',
];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Wake up Render backend + preload all static phrases into browser cache
  useEffect(() => {
    fetch(`${API_URL}/api/health`).catch(() => {});
    preloadPhrases(ALL_PHRASES);
  }, []);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/blind" element={<BlindMode />} />
      <Route path="/deaf" element={<DeafMode />} />
      <Route path="/mobility" element={<MobilityMode />} />
      <Route path="/camera" element={<CameraRecognition />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/gallery/:id" element={<GalleryDetailPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
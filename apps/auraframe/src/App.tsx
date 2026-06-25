import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import LuminousBrainWaves from './components/effects/LuminousBrainWaves';
import NavigationRail from './components/layout/NavigationRail';
import AIChatPanel from './components/panels/AIChatPanel';
import VideoGenerationModal from './components/modals/VideoGenerationModal';
import ImageGenerationModal from './components/modals/ImageGenerationModal';
import ContentBrainModal from './components/modals/ContentBrainModal';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/settings/SettingsPanel';
import { scheduleChecker } from './services/distributor';

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isBrainModalOpen, setIsBrainModalOpen] = useState(false);
  const [aiIntensity, setAiIntensity] = useState(0.4);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start schedule checker
  useEffect(() => {
    schedulerRef.current = scheduleChecker();
    return () => { if (schedulerRef.current) clearInterval(schedulerRef.current); };
  }, []);

  // Sync tab with route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') setActiveTab('inbox');
    else if (path === '/analytics') setActiveTab('analytics');
    else if (path === '/drafts') setActiveTab('drafts');
    else if (path === '/assets') setActiveTab('assets');
    else if (path === '/calendar') setActiveTab('calendar');
    else if (path === '/brain') setActiveTab('brain');
    else if (path === '/profile') setActiveTab('profile');
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'analytics':
        navigate('/analytics');
        break;
      case 'drafts':
        navigate('/drafts');
        break;
      case 'assets':
        navigate('/assets');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'brain':
        navigate('/brain');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  const handleOpenAIChat = () => {
    setIsAIChatOpen(true);
    setAiIntensity(0.8);
  };

  const handleCloseAIChat = () => {
    setIsAIChatOpen(false);
    setAiIntensity(0.4);
  };

  const handleOpenVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const handleOpenImageModal = () => {
    setIsImageModalOpen(true);
  };

  const handleOpenBrainModal = () => {
    setIsBrainModalOpen(true);
    setAiIntensity(0.9);
  };

  const handleCloseBrainModal = () => {
    setIsBrainModalOpen(false);
    setAiIntensity(0.4);
  };

  const handleChatHistoryUpdate = (messages: { role: string; content: string }[]) => {
    setChatHistory(messages);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* Living Background - Luminous Brain Waves */}
      <LuminousBrainWaves intensity={aiIntensity} />

      {/* Navigation Sidebar */}
      <NavigationRail
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAIChat={handleOpenAIChat}
      />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              onOpenVideoModal={handleOpenVideoModal}
              onOpenImageModal={handleOpenImageModal}
              onOpenAIChat={handleOpenAIChat}
              onOpenBrainModal={handleOpenBrainModal}
            />
          }
        />
        <Route
          path="*"
          element={
            <Dashboard
              onOpenVideoModal={handleOpenVideoModal}
              onOpenImageModal={handleOpenImageModal}
              onOpenAIChat={handleOpenAIChat}
              onOpenBrainModal={handleOpenBrainModal}
            />
          }
        />
        <Route path="/profile" element={<SettingsPanel />} />
      </Routes>

      {/* Floating AI Co-Pilot Panel */}
      <AIChatPanel isOpen={isAIChatOpen} onClose={handleCloseAIChat} onHistoryUpdate={handleChatHistoryUpdate} />

      {/* Video Generation Modal */}
      <VideoGenerationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* Image Generation Modal */}
      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      {/* Content Brain Modal */}
      <ContentBrainModal
        isOpen={isBrainModalOpen}
        onClose={handleCloseBrainModal}
        chatHistory={chatHistory}
      />
    </div>
  );
}

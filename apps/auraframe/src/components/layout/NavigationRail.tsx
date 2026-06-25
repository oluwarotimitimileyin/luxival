import { motion } from 'framer-motion';
import {
  Brain,
  Inbox,
  Calendar,
  BarChart3,
  FileText,
  Image,
  Zap,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface NavigationRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAIChat: () => void;
}

const navItems = [
  { id: 'aura', icon: Brain, label: 'Aura' },
  { id: 'brain', icon: Zap, label: 'Content Brain' },
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'drafts', icon: FileText, label: 'Drafts' },
  { id: 'assets', icon: Image, label: 'Assets' },
  { id: 'profile', icon: Settings, label: 'Profile' },
];

const bottomNavItems = [
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'aura', icon: MessageSquare, label: 'Aura' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'profile', icon: Settings, label: 'Profile' },
];

export default function NavigationRail({ activeTab, onTabChange, onOpenAIChat }: NavigationRailProps) {
  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] glass-panel z-50 flex-col items-center py-4">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAIChat}
          className="mb-8 relative"
        >
          <div className="w-10 h-10 rounded-xl gradient-cyan flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#141414]" />
        </motion.button>

        {/* Main Nav Items */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (item.id === 'aura') {
                    onOpenAIChat();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200 group"
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl gradient-cyan opacity-20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-cyan-400' : 'text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.7)]'
                  }`}
                />
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 z-50">
                  {item.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-[rgba(255,255,255,0.06)] safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (item.id === 'aura') {
                    onOpenAIChat();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-[rgba(255,255,255,0.4)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

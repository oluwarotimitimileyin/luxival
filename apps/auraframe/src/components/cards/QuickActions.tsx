import { motion } from 'framer-motion';
import {
  Film,
  MessageSquare,
  PenLine,
  CalendarPlus,
  ImageIcon,
  BrainCircuit,
} from 'lucide-react';

interface QuickActionsProps {
  onOpenVideoModal: () => void;
  onOpenImageModal: () => void;
  onOpenAIChat: () => void;
  onOpenBrainModal?: () => void;
}

const actions = [
  {
    id: 'brain',
    label: 'Content Brain',
    description: 'Conversation → multi-platform content',
    icon: BrainCircuit,
    color: 'from-cyan-500 to-blue-600',
    shadowColor: 'rgba(6, 182, 212, 0.25)',
  },
  {
    id: 'video',
    label: 'Create Video',
    description: 'Claude + ChatGPT + Remotion',
    icon: Film,
    color: 'from-purple-500 to-pink-500',
    shadowColor: 'rgba(168, 85, 247, 0.25)',
  },
  {
    id: 'image',
    label: 'Generate Image',
    description: 'Nano Banana + ChatGPT',
    icon: ImageIcon,
    color: 'from-cyan-500 to-blue-500',
    shadowColor: 'rgba(6, 182, 212, 0.25)',
  },
  {
    id: 'post',
    label: 'Write Post',
    description: 'AI writes for all platforms',
    icon: PenLine,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Plan your content calendar',
    icon: CalendarPlus,
    color: 'from-indigo-500 to-violet-500',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
  },
  {
    id: 'chat',
    label: 'Chat with Aura',
    description: 'Your AI co-pilot',
    icon: MessageSquare,
    color: 'from-rose-500 to-pink-500',
    shadowColor: 'rgba(244, 63, 94, 0.25)',
  },
];

export default function QuickActions({ onOpenVideoModal, onOpenImageModal, onOpenAIChat, onOpenBrainModal }: QuickActionsProps) {
  const handleAction = (id: string) => {
    switch (id) {
      case 'brain':
        onOpenBrainModal?.();
        break;
      case 'video':
        onOpenVideoModal();
        break;
      case 'image':
        onOpenImageModal();
        break;
      case 'chat':
        onOpenAIChat();
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.id)}
            className="relative flex items-center gap-3 p-3.5 rounded-xl glass-surface hover:glass-elevated transition-all duration-200 text-left group overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${action.shadowColor}, transparent)`,
              }}
            />

            <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                {action.label}
              </p>
              <p className="text-[10px] text-[rgba(255,255,255,0.4)] mt-0.5">
                {action.description}
              </p>
            </div>

            {action.id === 'chat' && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

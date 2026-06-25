import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Play, Sparkles, Film } from 'lucide-react';
import { apiConfig } from '@/services/apiConfig';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoGenerationModal({ isOpen, onClose }: VideoGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setIsComplete(false);

    // TODO: Replace with actual video generation API call
    setTimeout(() => {
      setIsGenerating(false);
      setIsComplete(true);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-[900px] max-h-[90dvh] glass-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Video Studio</h3>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">
                    {apiConfig.hasAnyAIProvider() ? 'AI-Powered Video Creation' : 'Configure AI in Settings'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <X className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
              </motion.button>
            </div>

            <div className="flex flex-col lg:flex-row overflow-y-auto max-h-[calc(90dvh-72px)]">
              {/* Left Panel - Prompt Input */}
              <div className="w-full lg:w-[320px] lg:border-r border-[rgba(255,255,255,0.06)] p-4 sm:p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2 block">
                    Content Brief
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want the video to be about..."
                    rows={4}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.25)] resize-none focus:outline-none focus:border-[rgba(6,182,212,0.4)] transition-all scrollbar-thin"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2 block">
                    AI Engines
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg glass-surface">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">Groq — Script Generation</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg glass-surface">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">AI Model — Video Composition</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || !apiConfig.hasAnyAIProvider()}
                  className="w-full py-3 rounded-xl btn-shimmer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {isGenerating ? 'Generating...' : 'Generate Video'}
                  </span>
                </motion.button>
              </div>

              {/* Right Panel - Preview */}
              <div className="flex-1 p-4 sm:p-5">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#050505] border border-[rgba(255,255,255,0.06)]">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl gradient-cyan flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm text-cyan-400">Generating your video...</p>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full gradient-cyan"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : isComplete ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 rounded-2xl gradient-cyan flex items-center justify-center mx-auto shadow-glow">
                          <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <p className="text-sm text-[rgba(255,255,255,0.5)]">Video generated successfully</p>
                        <p className="text-xs text-[rgba(255,255,255,0.3)]">
                          Connect a video rendering service to preview
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto">
                          <Film className="w-8 h-8 text-[rgba(255,255,255,0.15)]" />
                        </div>
                        <p className="text-sm text-[rgba(255,255,255,0.3)]">
                          Enter a content brief and click Generate to create your video
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Output options */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 grid grid-cols-3 gap-3"
                  >
                    {['16:9 Landscape', '9:16 Shorts', '1:1 Square'].map((format) => (
                      <button
                        key={format}
                        className="px-3 py-2 rounded-xl glass-surface text-xs text-[rgba(255,255,255,0.6)] hover:glass-elevated hover:text-white transition-all text-center"
                      >
                        {format}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

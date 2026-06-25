import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Sparkles, Zap, ImageIcon } from 'lucide-react';
import { apiConfig } from '@/services/apiConfig';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageGenerationModal({ isOpen, onClose }: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');

  const styles = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'neon', label: 'Neon Glow' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'abstract', label: 'Abstract' },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);

    // TODO: Replace with actual image generation API call
    // e.g., call an AI image model via API
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage(null);
    }, 2000);
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
            className="w-full max-w-[800px] max-h-[90dvh] glass-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Image Studio</h3>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">
                    {apiConfig.hasAnyAIProvider() ? 'AI-Powered Generation' : 'Configure AI in Settings'}
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
              {/* Left Panel */}
              <div className="w-full lg:w-[320px] lg:border-r border-[rgba(255,255,255,0.06)] p-4 sm:p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2 block">
                    Image Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={4}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.25)] resize-none focus:outline-none focus:border-[rgba(6,182,212,0.4)] transition-all scrollbar-thin"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2 block">
                    Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          selectedStyle === style.id
                            ? 'gradient-cyan text-white shadow-glow'
                            : 'glass-surface text-[rgba(255,255,255,0.6)] hover:glass-elevated'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-2 block">
                    AI Engines
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg glass-surface">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">AI Model — Image Gen</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg glass-surface">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">Groq — Prompt Refine</span>
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
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                  </span>
                </motion.button>
              </div>

              {/* Right Panel - Preview */}
              <div className="flex-1 p-4 sm:p-5">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#050505] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-2xl gradient-cyan flex items-center justify-center mx-auto shadow-glow"
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                      <p className="text-sm text-[rgba(255,255,255,0.5)]">Generating your image...</p>
                      <div className="w-48 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mx-auto">
                        <motion.div
                          className="h-full gradient-cyan"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, ease: 'easeInOut' }}
                        />
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center space-y-3 px-4">
                      <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-[rgba(255,255,255,0.15)]" />
                      </div>
                      <p className="text-sm text-[rgba(255,255,255,0.3)]">
                        Enter a prompt and generate to create your image
                      </p>
                    </div>
                  )}
                </div>

                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex gap-3"
                  >
                    <button className="flex-1 py-2.5 rounded-xl glass-surface text-xs text-[rgba(255,255,255,0.6)] hover:glass-elevated hover:text-white transition-all">
                      Download
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl glass-surface text-xs text-[rgba(255,255,255,0.6)] hover:glass-elevated hover:text-white transition-all">
                      Use in Post
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl glass-surface text-xs text-[rgba(255,255,255,0.6)] hover:glass-elevated hover:text-white transition-all">
                      Regenerate
                    </button>
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

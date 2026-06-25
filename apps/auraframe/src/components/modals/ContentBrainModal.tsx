import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BrainCircuit, MessageSquare, FileText, ImageIcon,
  Sparkles, Globe, Check, AlertCircle,
  Loader2, Camera, Send, History, Volume2, Film, Zap
} from 'lucide-react';
import type { BrainResult, BrainInput, BrainOutput } from '../../services/contentBrain';
import { processBrainInputs, chatTranscriptToInput, textToInput, workSessionToInput, getBrainHistory } from '../../services/contentBrain';
import type { ToneProfile } from '../../services/toneService';
import { getToneProfile, analyzeTone } from '../../services/toneService';
import type { DistributionPlan } from '../../services/distributor';
import { distributeNow, getDistributionPlans } from '../../services/distributor';
import type { RemotionJob } from '../../services/remotionService';
import { getRemotionJobs, queueRemotionRender } from '../../services/remotionService';

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
  { id: 'twitter', label: 'X / Twitter', color: '#1DA1F2' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', label: 'TikTok', color: '#00f2ea' },
  { id: 'pinterest', label: 'Pinterest', color: '#BD081C' },
  { id: 'reddit', label: 'Reddit', color: '#FF4500' },
  { id: 'telegram', label: 'Telegram', color: '#0088cc' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
];

interface ContentBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory?: { role: string; content: string }[];
}

type Tab = 'input' | 'results' | 'history' | 'tone';

export default function ContentBrainModal({ isOpen, onClose, chatHistory }: ContentBrainModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [inputMode, setInputMode] = useState<'text' | 'session' | 'chat'>('text');
  const [textInput, setTextInput] = useState('');
  const [sessionInput, setSessionInput] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'twitter', 'instagram']);
  const [toneProfile, setToneProfile] = useState<ToneProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<BrainResult | null>(null);
  const [brainHistory, setBrainHistory] = useState<BrainResult[]>([]);
  const [distributionPlans, setDistributionPlans] = useState<DistributionPlan[]>([]);
  const [remotionJobs, setRemotionJobs] = useState<RemotionJob[]>([]);
  const [error, setError] = useState('');
  const [toneStatus, setToneStatus] = useState<'none' | 'analyzing' | 'ready'>('none');

  useEffect(() => {
    if (isOpen) {
      setToneProfile(getToneProfile());
      setBrainHistory(getBrainHistory());
      setDistributionPlans(getDistributionPlans());
      setRemotionJobs(getRemotionJobs());
      if (getToneProfile()) setToneStatus('ready');
    }
  }, [isOpen]);

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleAnalyzeTone() {
    if (!chatHistory || chatHistory.length < 5) {
      setError('Need at least 5 chat messages to analyze tone. Use the chat panel first.');
      return;
    }
    setToneStatus('analyzing');
    setError('');
    const profile = await analyzeTone([chatHistory]);
    if (profile) {
      setToneProfile(profile);
      setToneStatus('ready');
    } else {
      setError('Tone analysis failed. Make sure you have enough conversation history.');
      setToneStatus('none');
    }
  }

  async function buildInputs(): Promise<BrainInput[]> {
    const inputs: BrainInput[] = [];
    if (inputMode === 'text' && textInput.trim()) {
      inputs.push(textToInput(textInput.trim()));
    } else if (inputMode === 'session' && sessionInput.trim()) {
      inputs.push(workSessionToInput(sessionInput.trim(), sessionTitle || undefined));
    } else if (inputMode === 'chat' && chatHistory && chatHistory.length > 0) {
      inputs.push(await chatTranscriptToInput(chatHistory));
    }
    if (inputs.length === 0) setError('Add some content first.');
    return inputs;
  }

  async function handleGenerate() {
    setError('');
    const inputs = await buildInputs();
    if (inputs.length === 0) return;

    setIsProcessing(true);
    try {
      const result = await processBrainInputs(inputs, toneProfile, selectedPlatforms);
      setCurrentResult(result);
      setActiveTab('results');
      setBrainHistory(getBrainHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDistributeAll() {
    if (!currentResult) return;
    const contentByPlatform: Record<string, string> = {};
    for (const out of currentResult.outputs) {
      contentByPlatform[out.platform] = out.post;
    }
    await distributeNow(selectedPlatforms, contentByPlatform);
    setDistributionPlans(getDistributionPlans());
  }

  async function handleRenderVideo(_platform: string, script: string, title: string) {
    await queueRemotionRender(title, script, 60, 'vertical');
    setRemotionJobs(getRemotionJobs());
  }

  function resetInputs() {
    setTextInput('');
    setSessionInput('');
    setSessionTitle('');
    setCurrentResult(null);
    setActiveTab('input');
    setError('');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)]"
            style={{ background: '#0d0d0d' }}
            initial={{ scale: 0.96, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 20 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]" style={{ background: '#0d0d0d' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Content Brain</h2>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Conversation → multi-platform content in your voice</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {toneStatus === 'ready' && toneProfile && (
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" />Tone locked
                  </span>
                )}
                {toneStatus === 'none' && chatHistory && chatHistory.length >= 5 && (
                  <button
                    onClick={handleAnalyzeTone}
                    className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 bg-[rgba(255,255,255,0.04)] px-2.5 py-1 rounded-full transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />Learn my voice
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                  <X className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2 border-b border-[rgba(255,255,255,0.04)]">
              {[
                { id: 'input' as Tab, label: 'Create', icon: Zap },
                { id: 'results' as Tab, label: 'Output', icon: Sparkles },
                { id: 'history' as Tab, label: 'History', icon: History },
                { id: 'tone' as Tab, label: 'Voice Profile', icon: Volume2 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-cyan-300 bg-cyan-400/10'
                      : 'text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* TAB: Input */}
              {activeTab === 'input' && (
                <div className="space-y-5">
                  {/* Input mode selector */}
                  <div className="flex gap-2">
                    {[
                      { id: 'text', label: 'Text / Notes', icon: FileText },
                      { id: 'session', label: 'Work Session', icon: Camera },
                      { id: 'chat', label: 'Chat History', icon: MessageSquare },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => { setInputMode(mode.id as typeof inputMode); setError(''); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          inputMode === mode.id
                            ? 'text-cyan-300 bg-cyan-400/10 border border-cyan-400/20'
                            : 'text-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        <mode.icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Text input */}
                  <AnimatePresence mode="wait">
                    {inputMode === 'text' && (
                      <motion.div key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <label className="block text-xs text-[rgba(255,255,255,0.5)] mb-2">Paste your text, article, notes, or anything you want turned into content</label>
                        <textarea
                          value={textInput}
                          onChange={e => setTextInput(e.target.value)}
                          placeholder="Paste a long string of text from your work session, a chat conversation, your thoughts, a blog post draft, anything..."
                          className="w-full min-h-[200px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-cyan-400/30 resize-y"
                        />
                      </motion.div>
                    )}

                    {inputMode === 'session' && (
                      <motion.div key="session" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        <input
                          value={sessionTitle}
                          onChange={e => setSessionTitle(e.target.value)}
                          placeholder="Session title (e.g. 'Website audit findings')"
                          className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-cyan-400/30"
                        />
                        <textarea
                          value={sessionInput}
                          onChange={e => setSessionInput(e.target.value)}
                          placeholder="Paste your work session notes, code snippets, client feedback, research findings..."
                          className="w-full min-h-[200px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-cyan-400/30 resize-y"
                        />
                      </motion.div>
                    )}

                    {inputMode === 'chat' && (
                      <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="p-4 rounded-xl bg-[rgba(6,182,212,0.06)] border border-cyan-400/10">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-300 font-medium">Chat conversation ready</span>
                          </div>
                          <p className="text-xs text-[rgba(255,255,255,0.5)]">
                            {chatHistory ? `${chatHistory.length} messages available` : 'No chat history found. Start a conversation with Aura first.'}
                          </p>
                          {chatHistory && chatHistory.length > 0 && (
                            <div className="mt-3 max-h-[150px] overflow-y-auto space-y-1.5 text-xs text-[rgba(255,255,255,0.5)] border-t border-[rgba(255,255,255,0.06)] pt-3">
                              {chatHistory.slice(-6).map((m, i) => (
                                <div key={i} className="flex gap-2">
                                  <span className={`font-medium min-w-[60px] ${m.role === 'user' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                    {m.role === 'user' ? 'You' : 'Aura'}
                                  </span>
                                  <span className="truncate">{m.content.slice(0, 80)}...</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Platform selector */}
                  <div>
                    <label className="block text-xs text-[rgba(255,255,255,0.5)] mb-2.5">Target platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedPlatforms.includes(p.id)
                              ? 'text-white border'
                              : 'text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-[rgba(255,255,255,0.1)]'
                          }`}
                          style={selectedPlatforms.includes(p.id) ? { borderColor: p.color, background: `${p.color}15` } : {}}
                        >
                          <Globe className="w-3 h-3" />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing... generating for {selectedPlatforms.length} platforms</>
                    ) : (
                      <><BrainCircuit className="w-4 h-4" /> Generate content across {selectedPlatforms.length} platforms</>
                    )}
                  </button>
                </div>
              )}

              {/* TAB: Results */}
              {activeTab === 'results' && (
                <div className="space-y-4">
                  {currentResult ? (
                    <>
                      <div className="p-3 rounded-xl bg-[rgba(6,182,212,0.06)] border border-cyan-400/10">
                        <p className="text-xs text-[rgba(255,255,255,0.5)] mb-1">Summary</p>
                        <p className="text-sm text-white whitespace-pre-wrap">{currentResult.summary}</p>
                      </div>

                      {currentResult.outputs.map((out: BrainOutput, idx: number) => (
                        <motion.div
                          key={out.platform}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5" style={{ color: PLATFORMS.find(p => p.id === out.platform)?.color }} />
                              <span className="text-xs font-medium text-white capitalize">{out.platform}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigator.clipboard.writeText(out.post)}
                                className="text-[10px] text-[rgba(255,255,255,0.4)] hover:text-cyan-400 transition-colors px-2 py-1 rounded"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => handleRenderVideo(out.platform, out.videoScript, out.post.slice(0, 40))}
                                className="flex items-center gap-1 text-[10px] text-[rgba(255,255,255,0.4)] hover:text-cyan-400 transition-colors px-2 py-1 rounded"
                              >
                                <Film className="w-3 h-3" /> Render
                              </button>
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1">Post</p>
                              <p className="text-xs text-[rgba(255,255,255,0.8)] whitespace-pre-wrap leading-relaxed">{out.post}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                                <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> Image prompt
                                </p>
                                <p className="text-[11px] text-[rgba(255,255,255,0.6)]">{out.imagePrompt}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                                <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Film className="w-3 h-3" /> Video script
                                </p>
                                <p className="text-[11px] text-[rgba(255,255,255,0.6)] whitespace-pre-wrap">{out.videoScript}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleDistributeAll}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" /> Post to all platforms now
                        </button>
                        <button
                          onClick={resetInputs}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)] text-xs font-medium hover:text-white transition-all"
                        >
                          Create another
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <BrainCircuit className="w-12 h-12 mx-auto mb-3 text-[rgba(255,255,255,0.15)]" />
                      <p className="text-sm text-[rgba(255,255,255,0.4)]">No results yet. Go to Create to generate content.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: History */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {brainHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 mx-auto mb-3 text-[rgba(255,255,255,0.15)]" />
                      <p className="text-sm text-[rgba(255,255,255,0.4)]">No brain sessions yet.</p>
                    </div>
                  ) : (
                    brainHistory.slice(0, 20).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => { setCurrentResult(item); setActiveTab('results'); }}
                        className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] hover:border-cyan-400/20 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded">
                              {item.sourceType}
                            </span>
                            <span className="text-[10px] text-[rgba(255,255,255,0.3)]">
                              {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-400">{item.outputs.length} outputs</span>
                        </div>
                        <p className="text-xs text-[rgba(255,255,255,0.6)] line-clamp-2">{item.summary.slice(0, 150)}</p>
                        <div className="flex gap-1.5 mt-2">
                          {item.outputs.map(o => (
                            <span key={o.platform} className="text-[9px] text-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 rounded">
                              {o.platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: Tone Profile */}
              {activeTab === 'tone' && (
                <div className="space-y-4">
                  {toneProfile ? (
                    <>
                      <div className="p-4 rounded-xl bg-[rgba(6,182,212,0.06)] border border-cyan-400/10">
                        <p className="text-xs text-[rgba(255,255,255,0.5)] mb-1">Voice description</p>
                        <p className="text-sm text-white">{toneProfile.voice}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Formality', value: toneProfile.formality, max: 10 },
                          { label: 'Humor', value: toneProfile.humor, max: 10 },
                          { label: 'Enthusiasm', value: toneProfile.enthusiasm, max: 10 },
                          { label: 'Technical Depth', value: toneProfile.technicalDepth, max: 10 },
                        ].map(metric => (
                          <div key={metric.label} className="p-3 rounded-xl border border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider">{metric.label}</span>
                              <span className="text-xs text-cyan-400">{metric.value}/{metric.max}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                style={{ width: `${(metric.value / metric.max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.06)]">
                          <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Vocabulary</p>
                          <div className="flex flex-wrap gap-1">
                            {toneProfile.vocabulary.map((w, i) => (
                              <span key={i} className="text-[10px] text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-full">{w}</span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.06)]">
                          <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">Signature phrases</p>
                          <div className="flex flex-wrap gap-1">
                            {toneProfile.signaturePhrases.map((p, i) => (
                              <span key={i} className="text-[10px] text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">{p}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAnalyzeTone}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Re-analyze
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Volume2 className="w-12 h-12 mx-auto mb-3 text-[rgba(255,255,255,0.15)]" />
                      <p className="text-sm text-[rgba(255,255,255,0.4)] mb-4">No tone profile yet. Analyze your chat history to capture your voice.</p>
                      <button
                        onClick={handleAnalyzeTone}
                        disabled={toneStatus === 'analyzing'}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium disabled:opacity-50"
                      >
                        {toneStatus === 'analyzing' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-3.5 h-3.5" /> Analyze my chat voice</>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with distribution history */}
            {(distributionPlans.length > 0 || remotionJobs.length > 0) && (
              <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-4">
                  {distributionPlans.filter(p => p.status === 'done' || p.status === 'partial').length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Send className="w-3 h-3" /> {distributionPlans.filter(p => p.status === 'done').length} published
                    </span>
                  )}
                  {remotionJobs.filter(j => j.status === 'done').length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-cyan-400">
                      <Film className="w-3 h-3" /> {remotionJobs.filter(j => j.status === 'done').length} videos rendered
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

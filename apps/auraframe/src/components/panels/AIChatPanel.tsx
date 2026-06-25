import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { useTextScramble } from '@/hooks/useTextScramble';
import { chatWithGPT, generateSocialPost, generateMultiPlatformPost, generateFromProgress, draftReply } from '@/services/openaiService';
import { apiConfig } from '@/services/apiConfig';

export default function AIChatPanel({ isOpen, onClose, onHistoryUpdate }: { isOpen: boolean; onClose: () => void; onHistoryUpdate?: (messages: { role: string; content: string }[]) => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thinking = useTextScramble('Generating...', isTyping);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      onHistoryUpdate?.(messages.map(m => ({ role: m.role, content: m.content })));
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && !messages.length) {
      setMessages([{
        id: 'w', role: 'assistant',
        content: apiConfig.hasAnyAIProvider()
          ? "Hey! I'm Aura, your AI content co-pilot. I support OpenAI, Groq, DeepSeek, and OpenRouter with automatic failover. Tell me about your day and I'll create content for all platforms!"
          : "Hey! I'm Aura. To activate AI, add at least one API key in Settings:\n\nFREE options:\n- Groq: console.groq.com (free tier, no card)\n- DeepSeek: platform.deepseek.com (very cheap)\n- OpenRouter: openrouter.ai (one key, many models)",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const addMsg = (role: string, content: string, provider?: string, isErr = false) =>
    setMessages(p => [...p, { id: Date.now().toString(), role, content, provider, isError: isErr }]);

  const send = async () => {
    if (!input.trim()) return;
    if (!apiConfig.hasAnyAIProvider()) { addMsg('assistant', 'Add an AI provider key in Settings first!', undefined, true); return; }
    const u = input.trim(); addMsg('user', u); setInput(''); setIsTyping(true);
    try {
      const lo = u.toLowerCase();
      if (lo.includes('post') || lo.includes('linkedin') || lo.includes('twitter') || lo.includes('instagram') || lo.includes('facebook') || lo.includes('tiktok') || lo.includes('youtube')) {
        const pl = ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest', 'reddit'].find(p => lo.includes(p));
        if (lo.includes('all') || lo.includes('every')) {
          addMsg('assistant', 'Creating content for all platforms...');
          const r = await generateMultiPlatformPost(u);
          addMsg('assistant', Object.entries(r).slice(0, 4).map(([p, c]) => `**${p.toUpperCase()}**: ${(c as string).slice(0, 200)}...`).join('\n\n'));
        } else {
          const r = await generateSocialPost(u, pl || 'linkedin');
          r.error ? addMsg('assistant', r.error, undefined, true) : addMsg('assistant', r.content, r.provider);
        }
      } else if (lo.includes('reply') || lo.includes('email')) {
        const r = await draftReply(u);
        r.error ? addMsg('assistant', r.error, undefined, true) : addMsg('assistant', r.content, r.provider);
      } else if (lo.includes('progress') || lo.includes('today i') || lo.includes('my day')) {
        addMsg('assistant', 'Analyzing progress...');
        const r = await generateFromProgress(u);
        r.error ? addMsg('assistant', r.error, undefined, true) : addMsg('assistant', Object.entries(r.posts).slice(0, 3).map(([p, c]) => `**${p}**: ${(c as string).slice(0, 150)}...`).join('\n\n') + '\n\nImage: ' + r.imagePrompt.slice(0, 80) + '...');
      } else {
        const r = await chatWithGPT([...messages.filter((m: any) => !m.isError).slice(-6).map((m: any) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: u }]);
        r.error ? addMsg('assistant', r.error, undefined, true) : addMsg('assistant', r.content, r.provider);
      }
    } catch { addMsg('assistant', 'All AI providers failed. Check your API keys in Settings.', undefined, true); }
    setIsTyping(false);
  };

  return (
    <AnimatePresence>
      {isOpen && <motion.div initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.95 }} className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[440px] h-[100dvh] sm:h-[640px] glass-panel rounded-none sm:rounded-3xl z-[60] flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div><h3 className="text-sm font-semibold text-white">Aura Assistant</h3><p className="text-xs text-white/40">{apiConfig.hasAnyAIProvider() ? 'Multi-Provider AI' : 'Add API key'}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {!apiConfig.hasAnyAIProvider() && <AlertCircle className="w-4 h-4 text-amber-400" />}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5"><X className="w-4 h-4 text-white/50" /></motion.button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((m: any) => <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'gradient-cyan' : 'bg-white/10'}`}>
              {m.role === 'assistant' ? <Sparkles className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-white/10 text-white rounded-tr-md' : m.isError ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-tl-md' : 'glass-surface text-white/90 rounded-tl-md border-l-2 border-cyan-400/40'}`}>
              {m.content}
              {m.provider && <div className="mt-1.5 text-[10px] text-cyan-400/70">via {m.provider}</div>}
            </div>
          </motion.div>)}
          {isTyping && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg gradient-cyan flex items-center justify-center flex-shrink-0"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
            <div className="glass-surface px-4 py-2.5 rounded-2xl rounded-tl-md border-l-2 border-cyan-400/40"><span className="text-sm text-white/70 font-mono">{thinking}</span></div>
          </motion.div>}
          <div ref={endRef} />
        </div>
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
          {['LinkedIn post', 'X thread', 'Instagram caption', 'Email reply'].map(q => <button key={q} onClick={() => { setInput(`Create a ${q} about: `); inputRef.current?.focus(); }} className="px-3 py-1.5 rounded-full glass-surface text-[10px] text-white/50 hover:text-cyan-400 whitespace-nowrap flex-shrink-0">{q}</button>)}
        </div>
        <div className="p-4 border-t border-white/5">
          <div className="relative">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={apiConfig.hasAnyAIProvider() ? 'Tell Aura about your progress...' : 'Add AI key in Settings first...'} rows={2} disabled={!apiConfig.hasAnyAIProvider()} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-cyan-400/40 transition-all scrollbar-thin disabled:opacity-40" />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={send} disabled={!input.trim() || !apiConfig.hasAnyAIProvider()} className="absolute right-2 bottom-2 w-8 h-8 rounded-lg btn-shimmer flex items-center justify-center disabled:opacity-40"><Send className="w-4 h-4 text-white" /></motion.button>
          </div>
          {!apiConfig.hasAnyAIProvider() && <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Add at least one AI key in Settings (Groq is free!)</p>}
        </div>
      </motion.div>}
    </AnimatePresence>
  );
}

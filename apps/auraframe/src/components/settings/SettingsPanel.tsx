import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Save, Check, AlertCircle, ExternalLink, Zap, PlayCircle, Loader2, X, ShieldCheck } from 'lucide-react';
import { apiConfig } from '@/services/apiConfig';
import { getProviderStatus, providers } from '@/services/aiProviders';

const socialFields = [
  { name: 'twitter_api_key', label: 'Twitter API Key', cat: 'X (Twitter)', url: 'https://developer.twitter.com/en/portal/dashboard' },
  { name: 'twitter_api_secret', label: 'Twitter API Secret', cat: 'X (Twitter)', url: 'https://developer.twitter.com/en/portal/dashboard' },
  { name: 'twitter_access_token', label: 'Twitter Access Token', cat: 'X (Twitter)', url: 'https://developer.twitter.com/en/portal/dashboard' },
  { name: 'twitter_access_secret', label: 'Twitter Access Secret', cat: 'X (Twitter)', url: 'https://developer.twitter.com/en/portal/dashboard' },
  { name: 'twitter_bearer', label: 'Twitter Bearer Token', cat: 'X (Twitter)', url: 'https://developer.twitter.com/en/portal/dashboard' },
  { name: 'linkedin_access_token', label: 'LinkedIn Access Token', cat: 'LinkedIn', url: 'https://www.linkedin.com/developers/' },
  { name: 'facebook_page_token', label: 'Facebook Page Token', cat: 'Facebook & Instagram', url: 'https://developers.facebook.com/tools/explorer/' },
  { name: 'instagram_token', label: 'Instagram Token', cat: 'Facebook & Instagram', url: 'https://developers.facebook.com/tools/explorer/' },
  { name: 'pinterest_access_token', label: 'Pinterest Token', cat: 'Pinterest', url: 'https://developers.pinterest.com/' },
  { name: 'reddit_access_token', label: 'Reddit Token', cat: 'Reddit', url: 'https://www.reddit.com/prefs/apps' },
  { name: 'telegram_bot_token', label: 'Telegram Bot Token', cat: 'Telegram', url: 'https://t.me/BotFather' },
  { name: 'whatsapp_token', label: 'WhatsApp Token', cat: 'WhatsApp', url: 'https://business.facebook.com/' },
];

type TestState = { status: 'idle' | 'testing' | 'pass' | 'fail'; message?: string };

export default function SettingsPanel() {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [testStates, setTestStates] = useState<Record<string, TestState>>({});
  const [, setTick] = useState(0);

  useEffect(() => {
    apiConfig.refresh();
    const unsub = apiConfig.onStatusChange(() => setTick(t => t + 1));
    return unsub;
  }, []);

  const aiProviders = getProviderStatus();
  const configuredCount = aiProviders.filter(p => p.configured).length;

  const handleInput = (name: string, value: string) => {
    setInputs(p => ({ ...p, [name]: value }));
    setTestStates(p => ({ ...p, [name]: { status: 'idle' } }));
  };

  const handleSave = async (name: string) => {
    const value = inputs[name];
    if (!value?.trim()) return;
    await apiConfig.setKey(name, value);
    setSavedKey(name);
    setInputs(p => ({ ...p, [name]: '' }));
    setTimeout(() => setSavedKey(null), 2000);
  };

  const handleTest = async (name: string) => {
    setTestStates(p => ({ ...p, [name]: { status: 'testing' } }));
    const result = await apiConfig.testKey(name);
    setTestStates(p => ({
      ...p,
      [name]: { status: result.ok ? 'pass' : 'fail', message: result.ok ? result.message : result.error },
    }));
  };

  const handleRemove = async (name: string) => {
    await apiConfig.removeKey(name);
    setTestStates(p => ({ ...p, [name]: { status: 'idle' } }));
  };

  const gc = socialFields.reduce((a, f) => { (a[f.cat] = a[f.cat] || []).push(f); return a; }, {} as Record<string, typeof socialFields>);

  return (
    <div className="ml-0 md:ml-[72px] min-h-screen relative z-10 pb-24 md:pb-0">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">API Keys & Integrations</h1>
          </div>
          <p className="text-sm text-white/50">Keys are stored securely on the server. They never reach your browser.</p>
        </div>

        {/* AI Provider Status */}
        <div className="glass-surface rounded-2xl p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-400" />AI Provider Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {aiProviders.map(p => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${p.configured ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${p.configured ? 'bg-emerald-400' : 'bg-white/20'}`} />
                <span className={`text-sm ${p.configured ? 'text-emerald-400 font-medium' : 'text-white/40'}`}>{p.name}</span>
                <span className={`text-[10px] ml-auto px-2 py-0.5 rounded-full ${p.configured ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-white/30'}`}>{p.configured ? 'Active' : 'Not set'}</span>
              </div>
            ))}
          </div>
          {configuredCount === 0 && <div className="flex items-center gap-2 text-amber-400 text-sm"><AlertCircle className="w-4 h-4" />Add at least one AI provider key below. Groq is free and recommended as a starter.</div>}
          {configuredCount > 0 && <div className="text-emerald-400 text-sm">{configuredCount} provider{configuredCount > 1 ? 's' : ''} active. Failover order: {aiProviders.filter(p => p.configured).map(p => p.name.split(' ')[0]).join(' → ')}</div>}
        </div>

        {/* AI Provider Keys */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-surface rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-cyan-400" />AI Provider Keys</h2>
          <div className="space-y-3">
            {providers.map(p => {
              const ts = testStates[p.keyName] || { status: 'idle' };
              const isConfigured = apiConfig.hasKey(p.keyName);
              return (
                <div key={p.keyName} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-white/70">{p.keyLabel}</label>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400">#{p.fallbackOrder}</span>
                    {isConfigured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 ml-auto">Saved on server</span>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={inputs[p.keyName] || ''}
                      onChange={e => handleInput(p.keyName, e.target.value)}
                      placeholder={isConfigured ? '••••••• (key stored securely)' : `Paste your ${p.keyLabel}`}
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 transition-all"
                    />
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSave(p.keyName)} disabled={!inputs[p.keyName]?.trim()} className="px-4 py-2 rounded-lg gradient-cyan text-white text-sm font-medium flex items-center gap-1.5 whitespace-nowrap disabled:opacity-30">
                        {savedKey === p.keyName ? <><Check className="w-3.5 h-3.5" />Saved</> : <><Save className="w-3.5 h-3.5" />Save</>}
                      </motion.button>
                      {isConfigured && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleTest(p.keyName)} disabled={ts.status === 'testing'} className="px-4 py-2 rounded-lg bg-white/[0.06] text-white text-sm font-medium flex items-center gap-1.5 whitespace-nowrap hover:bg-white/[0.1] disabled:opacity-40">
                          {ts.status === 'testing' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Testing...</> : <><PlayCircle className="w-3.5 h-3.5" />Test</>}
                        </motion.button>
                      )}
                      {isConfigured && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleRemove(p.keyName)} className="px-2 py-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-colors" title="Remove key">
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  {/* Test result */}
                  {ts.status === 'pass' && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-400/10 px-3 py-2 rounded-lg">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />{ts.message}
                    </div>
                  )}
                  {ts.status === 'fail' && (
                    <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-400/10 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{ts.message}
                    </div>
                  )}
                  <a href={p.helpUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-cyan-400 transition-colors w-fit"><ExternalLink className="w-3 h-3" />Get key</a>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Social Media Keys */}
        {Object.entries(gc).map(([cat, fs]) => (
          <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-surface rounded-2xl p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-cyan-400" />{cat}</h2>
            <div className="space-y-4">
              {fs.map(f => {
                const isConfigured = apiConfig.hasKey(f.name);
                return (
                  <div key={f.name} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="block text-sm font-medium text-white/70">{f.label}</label>
                        {isConfigured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400">Saved</span>}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="password"
                          value={inputs[f.name] || ''}
                          onChange={e => handleInput(f.name, e.target.value)}
                          placeholder={isConfigured ? '••••••• (stored securely)' : 'Your key'}
                          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 transition-all"
                        />
                        <div className="flex gap-2">
                          <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-cyan-400 hover:bg-white/5 transition-colors whitespace-nowrap"><ExternalLink className="w-3.5 h-3.5" />Get key</a>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSave(f.name)} disabled={!inputs[f.name]?.trim()} className="px-4 py-2 rounded-lg gradient-cyan text-white text-sm font-medium flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto disabled:opacity-30">
                            {savedKey === f.name ? <><Check className="w-3.5 h-3.5" />Saved</> : <><Save className="w-3.5 h-3.5" />Save</>}
                          </motion.button>
                          {isConfigured && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleRemove(f.name)} className="px-2 py-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-colors" title="Remove key">
                              <X className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

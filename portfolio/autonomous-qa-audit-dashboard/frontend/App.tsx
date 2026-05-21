import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { JsonViewer } from './components/JsonViewer';
import { Code2, LayoutTemplate, ArrowRight, ShieldCheck, Loader2, TerminalSquare, Network, Wand2, Lock, CheckCircle2, X, CreditCard, Calendar, User, Building, ChevronLeft } from 'lucide-react';
import { generateAuditReport, generateSampleTelemetry } from './services/geminiService';
import { AuditReport } from './types';

type ModalView = 'options' | 'payment' | 'demo' | 'success';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'json'>('dashboard');
  const [auditData, setAuditData] = useState<AuditReport | null>(null);
  
  // Form State
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [playwrightLogs, setPlaywrightLogs] = useState('');
  const [apiLogs, setApiLogs] = useState('');
  
  // App State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<{playwright: string, apis: string} | null>(null);
  const [hasUsedFreeRun, setHasUsedFreeRun] = useState(false);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('options');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateSamples = async () => {
    if (!url) {
      setError("Please enter a Target Website URL first to generate relevant samples.");
      return;
    }
    setIsGeneratingSamples(true);
    setError(null);
    try {
      const samples = await generateSampleTelemetry(url);
      setSampleData(samples);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate sample logs. Please try again.");
    } finally {
      setIsGeneratingSamples(false);
    }
  };

  const handleAutoFill = () => {
    if (sampleData) {
      setPlaywrightLogs(sampleData.playwright);
      setApiLogs(sampleData.apis);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !email) return;

    if (hasUsedFreeRun) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const report = await generateAuditReport(url, email, playwrightLogs, apiLogs);
      setAuditData(report);
      setHasUsedFreeRun(true); // Lock future runs
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the audit report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setAuditData(null);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsUpgradeModalOpen(false);
    setTimeout(() => setModalView('options'), 300);
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setModalView('success');
      // If they "paid", we could unlock the app here:
      // setHasUsedFreeRun(false); 
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      {/* Top Navigation / Toggle */}
      <nav className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={resetApp}
        >
          <div className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white font-serif italic font-bold shadow-sm group-hover:scale-105 transition-transform">
            Q
          </div>
          <span className="font-medium tracking-wide text-sm text-brand-black">Autonomous QA</span>
        </div>
        
        {auditData && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'dashboard' 
                  ? 'bg-white text-brand-black shadow-sm' 
                  : 'text-gray-500 hover:text-brand-black'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Visual Audit
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'json' 
                  ? 'bg-white text-brand-black shadow-sm' 
                  : 'text-gray-500 hover:text-brand-black'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Raw JSON
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!auditData && !isGenerating && (
          <div className="flex-1 flex items-center justify-center p-6 py-12">
            <div className="max-w-3xl w-full bg-white rounded-[40px] p-10 md:p-16 shadow-xl border border-brand-pink/20 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-brand-pink/10 rounded-2xl mb-8 text-brand-pink">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-serif font-medium mb-4 text-brand-black">Initiate Audit</h1>
                <p className="text-gray-500 font-light mb-10">
                  Enter your target application URL, work email, and raw telemetry logs to orchestrate a comprehensive UI/UX and API analysis.
                </p>

                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-brand-black mb-2">Target Website URL</label>
                      <input
                        id="url"
                        type="url"
                        required
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all text-brand-black placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">Work Email</label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="qa@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all text-brand-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                      <h3 className="text-lg font-medium text-brand-black flex items-center gap-2">
                        <TerminalSquare className="w-5 h-5 text-gray-400" />
                        Raw Telemetry Data
                      </h3>
                      
                      <button
                        type="button"
                        onClick={handleGenerateSamples}
                        disabled={isGeneratingSamples || !url}
                        className="flex items-center gap-2 text-sm font-medium text-brand-pink bg-brand-pink/10 hover:bg-brand-pink/20 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingSamples ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        {isGeneratingSamples ? 'Generating...' : 'Generate Sample Logs'}
                      </button>
                    </div>

                    {sampleData && (
                      <div className="mb-6 p-5 bg-brand-cream border border-brand-pink/30 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-brand-black">Sample Data Generated</h4>
                          <button
                            type="button"
                            onClick={handleAutoFill}
                            className="flex items-center gap-1 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-brand-pass" />
                            Auto-fill Below
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-600">
                          <div className="bg-white p-3 rounded-xl border border-gray-100 h-24 overflow-y-auto">
                            <strong className="block mb-1 text-gray-800 font-sans">Playwright Logs:</strong>
                            {sampleData.playwright}
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-gray-100 h-24 overflow-y-auto">
                            <strong className="block mb-1 text-gray-800 font-sans">Suggested APIs:</strong>
                            {sampleData.apis}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="playwrightLogs" className="block text-sm font-medium text-gray-600 mb-2">Playwright Execution Logs</label>
                        <textarea
                          id="playwrightLogs"
                          placeholder="Paste raw Playwright console/network logs here..."
                          value={playwrightLogs}
                          onChange={(e) => setPlaywrightLogs(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all text-brand-black placeholder-gray-400 h-32 resize-y font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="apiLogs" className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                          <Network className="w-4 h-4" /> API Backend Telemetry
                        </label>
                        <textarea
                          id="apiLogs"
                          placeholder="Paste raw API response logs here..."
                          value={apiLogs}
                          onChange={(e) => setApiLogs(e.target.value)}
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all text-brand-black placeholder-gray-400 h-32 resize-y font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-brand-fail/10 text-brand-fail rounded-xl text-sm border border-brand-fail/20">
                      {error}
                    </div>
                  )}

                  {hasUsedFreeRun ? (
                    <div className="mt-8 p-6 bg-brand-black text-white rounded-2xl text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-brand-pink/20 to-transparent opacity-50 pointer-events-none"></div>
                      <Lock className="w-8 h-8 text-brand-pink mx-auto mb-3 relative z-10" />
                      <h3 className="text-xl font-serif mb-2 relative z-10">Free Run Exhausted</h3>
                      <p className="text-gray-400 text-sm mb-6 relative z-10">
                        You've successfully used your one-time free orchestration. Upgrade to a premium tier to run unlimited audits and unlock CI/CD pipeline integrations.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="relative z-10 bg-brand-pink text-brand-black px-8 py-3 rounded-xl font-medium hover:bg-white transition-colors"
                      >
                        Upgrade to Premium
                      </button>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-brand-black text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors group mt-4"
                    >
                      Run Orchestration (1 Free Run)
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-brand-pink rounded-full loader-pulse"></div>
              <div className="relative z-10 bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 text-brand-pink animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-medium mb-4 text-brand-black">Synthesizing Telemetry</h2>
            <p className="text-gray-500 font-light max-w-md mx-auto">
              Cross-examining visual design templates with raw Playwright and API logs. Generating structured layout and error reports...
            </p>
          </div>
        )}

        {auditData && !isGenerating && (
          viewMode === 'dashboard' ? (
            <Dashboard data={auditData} />
          ) : (
            <JsonViewer data={auditData} />
          )
        )}
      </main>

      {/* Global Upgrade Modal (Triggered from exhausted state) */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full relative shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand-black transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {(modalView === 'payment' || modalView === 'demo') && (
              <button
                onClick={() => setModalView('options')}
                className="absolute top-6 left-6 text-gray-400 hover:text-brand-black transition-colors z-20 flex items-center text-sm font-medium"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
            )}
            
            {modalView === 'options' && (
              <div className="mt-4">
                <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center mb-6 text-brand-pink">
                  <Lock className="w-8 h-8" />
                </div>
                
                <h3 className="text-3xl font-serif font-medium mb-4 text-brand-black">Upgrade Required</h3>
                <p className="text-gray-600 font-light mb-8 leading-relaxed">
                  Your free trial has concluded. Upgrade to our Premium QA tier to run unlimited audits, access historical data, and integrate directly with your CI/CD pipelines.
                </p>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setModalView('payment')}
                    className="w-full bg-brand-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Upgrade Now ($299/mo)
                  </button>
                  <button 
                    onClick={() => setModalView('demo')}
                    className="w-full bg-brand-pink/10 text-brand-pink py-4 rounded-xl font-medium hover:bg-brand-pink/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Request a Demo
                  </button>
                </div>
              </div>
            )}

            {modalView === 'payment' && (
              <div className="mt-8">
                <h3 className="text-2xl font-serif font-medium mb-2 text-brand-black">Secure Checkout</h3>
                <p className="text-gray-500 text-sm mb-6">Premium QA Tier - $299.00 / month</p>
                
                <form onSubmit={handleSimulatedSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Card Information</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-pink focus-within:ring-1 focus-within:ring-brand-pink transition-all">
                      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <input type="text" required placeholder="Card number" className="w-full bg-transparent outline-none text-sm" />
                      </div>
                      <div className="flex">
                        <div className="p-3 border-r border-gray-200 bg-gray-50 w-1/2">
                          <input type="text" required placeholder="MM / YY" className="w-full bg-transparent outline-none text-sm" />
                        </div>
                        <div className="p-3 bg-gray-50 w-1/2">
                          <input type="text" required placeholder="CVC" className="w-full bg-transparent outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name on Card</label>
                    <input type="text" required placeholder="Jane Doe" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all text-sm" />
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-brand-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay $299.00'}
                  </button>
                </form>
              </div>
            )}

            {modalView === 'demo' && (
              <div className="mt-8">
                <h3 className="text-2xl font-serif font-medium mb-2 text-brand-black">Schedule a Demo</h3>
                <p className="text-gray-500 text-sm mb-6">Speak with an engineering lead about your QA needs.</p>
                
                <form onSubmit={handleSimulatedSubmit} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" required className="w-full pl-9 p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all text-sm" />
                      </div>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" required className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" required className="w-full pl-9 p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Date</label>
                    <input type="date" required className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all text-sm text-gray-600" />
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-brand-pink text-brand-black py-4 rounded-xl font-medium hover:bg-brand-pink/90 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Request'}
                  </button>
                </form>
              </div>
            )}

            {modalView === 'success' && (
              <div className="mt-4 flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 bg-brand-pass/10 rounded-full flex items-center justify-center mb-6 text-brand-pass">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif font-medium mb-4 text-brand-black">Success!</h3>
                <p className="text-gray-600 font-light mb-8 leading-relaxed">
                  Your request has been processed successfully. Our team will be in touch with you shortly via email with the next steps.
                </p>
                <button 
                  onClick={() => {
                    handleCloseModal();
                    setHasUsedFreeRun(false); // Unlock the app for demo purposes
                  }}
                  className="w-full bg-gray-100 text-brand-black py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default App;

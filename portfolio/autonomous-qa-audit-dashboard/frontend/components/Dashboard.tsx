import React, { useState } from 'react';
import { AuditReport } from '../types';
import { StatusBadge } from './StatusBadge';
import { Activity, Layout, ArrowRight, X, ShieldCheck, CreditCard, Calendar, User, Building, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  data: AuditReport;
}

type ModalView = 'options' | 'payment' | 'demo' | 'success';

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { executive_metrics, asymmetrical_grid_cards, blocker_registry, personalized_upsell_triggers } = data;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('options');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    // Ensure case-insensitivity and provide a white fallback so it doesn't blend into the black background
    switch (status?.toUpperCase()) {
      case 'PASS': return '#10b981';
      case 'WARNING': return '#f59e0b';
      case 'FAIL': return '#ef4444';
      default: return '#ffffff'; 
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalView('options'), 300); // Reset after animation
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate network request for payment or demo submission
    setTimeout(() => {
      setIsProcessing(false);
      setModalView('success');
    }, 2000);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-24">
        
        {/* Hero Section */}
        <section className="relative flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          
          <div className="flex-1 z-10">
            <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6">
              Design & QA <br/>
              <span className="italic text-brand-pink">Audit Report</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md font-light mb-8">
              Target: <a href={executive_metrics.target_url} target="_blank" rel="noreferrer" className="underline decoration-brand-pink underline-offset-4 hover:text-brand-pink transition-colors">{executive_metrics.target_url}</a>
            </p>
            <div className="flex items-center gap-4">
              <StatusBadge status={executive_metrics.system_verdict} className="text-sm px-4 py-2" />
              <span className="text-sm font-medium tracking-widest uppercase text-gray-400">System Verdict</span>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-t-full rounded-b-[40px] bg-brand-black text-white flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
              <span className="text-sm font-medium tracking-widest uppercase mb-2 opacity-80">Health Score</span>
              <span className="text-7xl md:text-8xl font-serif font-light" style={{ color: getStatusColor(executive_metrics.system_verdict) }}>
                {executive_metrics.calculated_health_score ?? '--'}
              </span>
              <span className="text-xs mt-4 opacity-60">Out of 100</span>
            </div>
          </div>
        </section>

        {/* Asymmetrical Grid Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Web App Testing - Archway */}
          <div className="col-span-1 bg-white rounded-t-full rounded-b-3xl p-10 pt-20 shadow-sm border border-brand-pink/20 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-pink"></div>
            <Layout className="w-8 h-8 mb-6 text-brand-pink" strokeWidth={1.5} />
            <h3 className="text-xl font-serif mb-4">{asymmetrical_grid_cards.web_app_testing.section_title}</h3>
            <StatusBadge status={asymmetrical_grid_cards.web_app_testing.visual_status} className="mb-6" />
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              {asymmetrical_grid_cards.web_app_testing.critique}
            </p>
          </div>

          {/* API Testing - Circular */}
          <div className="col-span-1 bg-brand-black text-white rounded-full aspect-square p-10 flex flex-col items-center justify-center text-center shadow-xl relative group hover:scale-[1.02] transition-transform duration-500 max-w-md mx-auto w-full">
            <Activity className="w-8 h-8 mb-6 text-brand-pass" strokeWidth={1.5} />
            <h3 className="text-xl font-serif mb-4">{asymmetrical_grid_cards.api_backend_testing.section_title}</h3>
            <StatusBadge status={asymmetrical_grid_cards.api_backend_testing.visual_status} className="mb-6 bg-white/10 border-white/20" />
            <p className="text-sm text-gray-300 font-light leading-relaxed max-w-[80%]">
              {asymmetrical_grid_cards.api_backend_testing.critique}
            </p>
          </div>
        </section>

        {/* Blocker Registry */}
        <section className="bg-white rounded-[40px] p-10 md:p-16 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif">Blocker Registry</h2>
            <span className="text-sm font-medium tracking-widest uppercase text-gray-400">{blocker_registry.length} Issues Found</span>
          </div>
          
          {blocker_registry.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-light">
              No critical blockers detected during this audit.
            </div>
          ) : (
            <div className="space-y-8">
              {blocker_registry.map((blocker, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 items-start pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: blocker.ui_severity_token }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium">{blocker.issue_name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">{blocker.origin_layer}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-light leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 mt-3">
                      <span className="font-medium text-brand-black block mb-1">Remediation:</span>
                      {blocker.dev_remediation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upsell Triggers */}
        <section className="relative overflow-hidden rounded-[40px] bg-brand-black text-white p-10 md:p-16">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-brand-pink/20 to-transparent opacity-50 pointer-events-none"></div>
          <h2 className="text-3xl font-serif mb-10 relative z-10">Strategic Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {personalized_upsell_triggers.map((trigger, idx) => (
              <div 
                key={idx} 
                onClick={() => setIsModalOpen(true)}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors flex flex-col justify-between group cursor-pointer"
              >
                <p className="text-sm font-light leading-relaxed text-gray-300 mb-8">
                  {trigger}
                </p>
                <div className="flex items-center text-brand-pink text-sm font-medium tracking-wide uppercase group-hover:translate-x-2 transition-transform">
                  Explore Solution <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Premium Upsell Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full relative shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-brand-black transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Back Button (if not on options or success) */}
            {(modalView === 'payment' || modalView === 'demo') && (
              <button
                onClick={() => setModalView('options')}
                className="absolute top-6 left-6 text-gray-400 hover:text-brand-black transition-colors z-20 flex items-center text-sm font-medium"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
            )}
            
            {/* View: Options */}
            {modalView === 'options' && (
              <div className="mt-4">
                <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center mb-6 text-brand-pink">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <h3 className="text-3xl font-serif font-medium mb-4 text-brand-black">Unlock Premium QA</h3>
                <p className="text-gray-600 font-light mb-8 leading-relaxed">
                  Ready to implement these strategic recommendations? Upgrade your plan to access deep Mobile App QA, automated CI/CD pipeline tracking, and dedicated engineering support.
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

            {/* View: Payment */}
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

            {/* View: Demo Request */}
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

            {/* View: Success */}
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
                  onClick={handleCloseModal}
                  className="w-full bg-gray-100 text-brand-black py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

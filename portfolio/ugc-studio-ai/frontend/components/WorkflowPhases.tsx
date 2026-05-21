import React, { useState, useEffect } from 'react';
import { AppState, Action } from '../types.ts';
import { AgentMessage, Button, Card } from './Shared.tsx';
import { generateCharacterPrompt, analyzeTrends, generateScript, generateAssets, generateVideo } from '../services/ai.ts';
import { Upload, Play, Download, Lock, FileText, TrendingUp, User, Image as ImageIcon, Video } from 'lucide-react';

interface PhaseProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

// --- PHASE 1: Character Definition ---
export const Phase1Character: React.FC<PhaseProps> = ({ state, dispatch }) => {
  const [localChar, setLocalChar] = useState(state.character);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalChar({ ...localChar, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate reading files to base64
      const newImages = Array.from(files).map((_, i) => `https://picsum.photos/seed/${Math.random()}/400/400`);
      setLocalChar(prev => ({ ...prev, referenceImages: [...prev.referenceImages, ...newImages].slice(0, 3) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_CHARACTER', payload: localChar });
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const prompt = await generateCharacterPrompt(localChar);
      dispatch({ type: 'SET_REFINED_PROMPT', payload: prompt });
      dispatch({ type: 'SET_PHASE', payload: 2 });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate prompt' });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgentMessage message="Welcome to UGC Studio AI! Let's start by defining your digital creator. Upload some reference images and tell me about their physical attributes and vibe." />
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Reference Images (Up to 3)</label>
            <div className="flex gap-4 items-center">
              {localChar.referenceImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Ref ${idx}`} className="w-24 h-24 object-cover rounded-lg border border-slate-600" />
              ))}
              {localChar.referenceImages.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-slate-800 transition-colors">
                  <Upload size={20} className="text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">Upload</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Height</label>
              <input required name="height" value={localChar.height} onChange={handleChange} placeholder="e.g., 5'8&quot; / 172cm" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Weight/Build</label>
              <input required name="weight" value={localChar.weight} onChange={handleChange} placeholder="e.g., Athletic, Slim, 140lbs" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Skin Complexion</label>
              <input required name="skin" value={localChar.skin} onChange={handleChange} placeholder="e.g., Warm olive undertones, clear texture" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Accent / Voice Type</label>
              <input required name="accent" value={localChar.accent} onChange={handleChange} placeholder="e.g., Upbeat Californian, British RP" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Geographic Origin / Cultural Background</label>
              <input required name="origin" value={localChar.origin} onChange={handleChange} placeholder="e.g., Mixed Asian-American, born in NY" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Additional Personality/Style Notes</label>
              <textarea name="notes" value={localChar.notes} onChange={handleChange} rows={3} placeholder="e.g., Always wears minimalist jewelry, very expressive hands when talking." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={state.isProcessing}>
              Synthesize Character <User size={18} />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- PHASE 2: Niche & Trend Research ---
export const Phase2Niche: React.FC<PhaseProps> = ({ state, dispatch }) => {
  const [localNiche, setLocalNiche] = useState(state.niche);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalNiche({ ...localNiche, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_NICHE', payload: localNiche });
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const analysis = await analyzeTrends(localNiche);
      dispatch({ type: 'SET_TREND_ANALYSIS', payload: analysis });
      dispatch({ type: 'SET_PHASE', payload: 3 });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to analyze trends' });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgentMessage message="Great character profile! Now, tell me what this video is about. I'll analyze current YouTube and TikTok trends to ensure our content is optimized for virality." />
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Niche / Category</label>
            <input required name="category" value={localNiche.category} onChange={handleChange} placeholder="e.g., Skincare, B2B SaaS, Fitness" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Primary Message / Product</label>
            <textarea required name="message" value={localNiche.message} onChange={handleChange} rows={2} placeholder="e.g., Promoting a new Vitamin C serum that clears dark spots in 2 weeks." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience Demographic</label>
            <input required name="audience" value={localNiche.audience} onChange={handleChange} placeholder="e.g., Women 25-35 struggling with hyperpigmentation" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="secondary" onClick={() => dispatch({ type: 'SET_PHASE', payload: 1 })}>Back</Button>
            <Button type="submit" isLoading={state.isProcessing}>
              Analyze Trends <TrendingUp size={18} />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- PHASE 3: Script Synthesis ---
export const Phase3Script: React.FC<PhaseProps> = ({ state, dispatch }) => {
  const [localScript, setLocalScript] = useState(state.script);

  useEffect(() => {
    const fetchScript = async () => {
      if (!state.script && !state.isProcessing) {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
          const generated = await generateScript(state.refinedCharacterPrompt, state.trendAnalysis, state.niche);
          setLocalScript(generated);
          dispatch({ type: 'SET_SCRIPT', payload: generated });
        } catch (err: any) {
          dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate script' });
        } finally {
          dispatch({ type: 'SET_PROCESSING', payload: false });
        }
      }
    };
    fetchScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = () => {
    dispatch({ type: 'SET_SCRIPT', payload: localScript });
    dispatch({ type: 'SET_PHASE', payload: 4 });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgentMessage message="I've analyzed the trends and synthesized a production script tailored to your niche. Review the beat-by-beat breakdown below. You can edit it directly before we move to asset generation." />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FileText size={20} className="text-brand-400"/> Production Script</h3>
              {state.isProcessing && <Loader2 className="animate-spin text-brand-500" size={20} />}
            </div>
            <textarea 
              value={localScript} 
              onChange={(e) => setLocalScript(e.target.value)}
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none min-h-[400px]"
              disabled={state.isProcessing}
            />
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Trend Insights Applied</h3>
            <div className="text-sm text-slate-300 prose prose-invert max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Simple markdown rendering simulation */}
              {state.trendAnalysis.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
              ))}
            </div>
          </Card>
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleApprove} disabled={state.isProcessing || !localScript}>
              Approve & Generate Assets <ImageIcon size={18} />
            </Button>
            <Button variant="secondary" onClick={() => dispatch({ type: 'SET_PHASE', payload: 2 })} disabled={state.isProcessing}>
              Back to Research
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PHASE 4: Asset Generation ---
export const Phase4Assets: React.FC<PhaseProps> = ({ state, dispatch }) => {
  
  const handleGenerate = async () => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const images = await generateAssets(state.refinedCharacterPrompt);
      dispatch({ type: 'SET_GENERATED_IMAGES', payload: images });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to generate assets' });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  useEffect(() => {
    if (state.generatedImages.length === 0 && !state.isProcessing) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgentMessage message="Generating visual assets based on your character profile and script requirements. This ensures consistency across all frames." />
      
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Character Assets</h3>
          <Button variant="secondary" onClick={handleGenerate} isLoading={state.isProcessing} className="text-sm py-2">
            Regenerate
          </Button>
        </div>

        {state.isProcessing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video bg-slate-800 animate-pulse rounded-lg flex items-center justify-center border border-slate-700">
                <ImageIcon className="text-slate-600" size={48} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.generatedImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700">
                <img src={img} alt={`Generated Asset ${idx}`} className="w-full h-auto object-cover aspect-video" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">Asset {idx + 1} Ready</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-8 mt-8 border-t border-slate-700">
          <Button variant="secondary" onClick={() => dispatch({ type: 'SET_PHASE', payload: 3 })} disabled={state.isProcessing}>Back</Button>
          <Button onClick={() => dispatch({ type: 'SET_PHASE', payload: 5 })} disabled={state.isProcessing || state.generatedImages.length === 0}>
            Proceed to Video Assembly <Video size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// --- PHASE 5: Video Assembly ---
export const Phase5Video: React.FC<PhaseProps> = ({ state, dispatch }) => {
  const [loadingMessage, setLoadingMessage] = useState("Initializing rendering engine...");

  const handleGenerateVideo = async () => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const messages = [
      "Sequencing assets...",
      "Applying viral transitions...",
      "Synthesizing voiceover...",
      "Color grading to match aesthetic...",
      "Rendering final frames (this may take a few minutes)..."
    ];
    
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      if (msgIndex < messages.length) {
        setLoadingMessage(messages[msgIndex]);
        msgIndex++;
      }
    }, 8000);

    try {
      // Use the first generated image as a reference if available
      const refImage = state.generatedImages[0];
      const videoUrl = await generateVideo(state.refinedCharacterPrompt, refImage);
      dispatch({ type: 'SET_VIDEO_URL', payload: videoUrl });
      dispatch({ type: 'SET_PHASE', payload: 6 });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to assemble video' });
    } finally {
      clearInterval(msgInterval);
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      <AgentMessage message="All assets are ready. I will now orchestrate the final video assembly, applying the pacing, transitions, and audio elements defined in the script." />
      
      <Card className="py-12 flex flex-col items-center justify-center min-h-[400px]">
        {state.isProcessing ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
              <Video className="absolute inset-0 m-auto text-brand-400" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Assembling Video</h3>
              <p className="text-brand-400 animate-pulse">{loadingMessage}</p>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-4">
              High-quality video generation requires significant compute. Please keep this tab open.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-brand-900/30 rounded-full flex items-center justify-center mx-auto border border-brand-500/30">
              <Play className="text-brand-400 ml-1" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to Render</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Click below to begin the final rendering process. This will combine your character, script, and trend-optimized editing style.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="secondary" onClick={() => dispatch({ type: 'SET_PHASE', payload: 4 })}>Back</Button>
              <Button onClick={handleGenerateVideo}>Start Rendering</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- PHASE 6: Preview & Delivery ---
export const Phase6Delivery: React.FC<PhaseProps> = ({ state, dispatch }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgentMessage message="Your video is ready! Review the watermarked preview below. Unlock the high-resolution, unwatermarked version to post it to your channels." />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0 border-slate-700 bg-black">
            {state.videoUrl ? (
              <video 
                src={state.videoUrl} 
                controls 
                className="w-full aspect-video object-contain bg-black"
                poster={state.generatedImages[0]}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-slate-900 text-slate-500">
                Video preview unavailable
              </div>
            )}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">Final Render</h4>
                <p className="text-xs text-slate-400">1080p • 16:9 • Watermarked Preview</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">Viral Optimized</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock size={18} className="text-brand-400"/> Unlock Download
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Get the unwatermarked, full-resolution MP4 file ready for immediate upload to YouTube, TikTok, or Instagram.
            </p>
            
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Single Video License</span>
                <span className="text-xl font-bold text-white">$19.99</span>
              </div>
              <ul className="text-xs text-slate-500 space-y-1 mt-4">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-500"/> Commercial use rights</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-500"/> No watermarks</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-brand-500"/> 4K upscaling included</li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => alert("Mock Payment Flow Initiated via Stripe/LemonSqueezy")}>
              Pay to Download <Download size={18} />
            </Button>
          </Card>

          <Card>
             <h4 className="text-sm font-semibold text-slate-300 mb-2">Suggested Metadata</h4>
             <div className="space-y-3 text-sm">
               <div>
                 <span className="text-xs text-slate-500 block">Title</span>
                 <p className="text-brand-300 truncate">The Secret to {state.niche.message.substring(0, 20)}...</p>
               </div>
               <div>
                 <span className="text-xs text-slate-500 block">Hashtags</span>
                 <p className="text-slate-300">#{state.niche.category.replace(/\s+/g, '')} #UGC #Trending</p>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

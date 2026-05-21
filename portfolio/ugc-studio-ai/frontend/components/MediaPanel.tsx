import React from 'react';
import { AppState } from '../types.ts';
import { Image as ImageIcon, Video, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { Card, Button } from './Shared.tsx';

interface MediaPanelProps {
  state: AppState;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({ state }) => {
  const hasImages = state.generatedImages.length > 0;
  const hasVideo = !!state.videoUrl;
  const isGenerating = !!state.mediaStatus;

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Video className="text-brand-400" /> Studio Canvas
        </h2>
        <p className="text-sm text-slate-400">Your generated assets and final video will appear here.</p>
      </div>

      {isGenerating && (
        <Card className="mb-8 border-brand-500/30 bg-brand-900/10 flex flex-col items-center justify-center py-12 text-center animate-in fade-in">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
            <Loader2 className="absolute inset-0 m-auto text-brand-400 animate-pulse" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Processing Media</h3>
          <p className="text-sm text-brand-300">{state.mediaStatus}</p>
        </Card>
      )}

      {hasVideo && (
        <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-brand-500" /> Final Render
          </h3>
          <Card className="p-0 overflow-hidden bg-black border-slate-700">
            <video 
              src={state.videoUrl!} 
              controls 
              className="w-full aspect-video object-contain bg-black"
              poster={state.generatedImages[0]}
            >
              Your browser does not support the video tag.
            </video>
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white text-sm">UGC_Video_Final.mp4</h4>
                <p className="text-xs text-slate-400">1080p • Watermarked Preview</p>
              </div>
              <Button className="text-xs py-1.5 px-3" onClick={() => alert("Payment flow initiated.")}>
                Unlock <Download size={14} />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {hasImages && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-brand-500" /> Character Assets
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {state.generatedImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-video">
                <img src={img} alt={`Generated Asset ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-medium text-white bg-slate-900/80 px-2 py-1 rounded">Asset {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasImages && !hasVideo && !isGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
          <ImageIcon size={48} className="mb-4" />
          <p className="text-sm">Awaiting generation commands from the agent...</p>
        </div>
      )}
    </div>
  );
};

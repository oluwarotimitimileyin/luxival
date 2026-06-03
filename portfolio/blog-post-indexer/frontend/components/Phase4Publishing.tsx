import React from 'react';
import { CheckCircle, ExternalLink, RefreshCw, Search, Shield, Globe, Server } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { PublishedPost } from '../types.ts';

interface Props {
    post: PublishedPost;
    onReset: () => void;
}

export const Phase4Publishing: React.FC<Props> = ({ post, onReset }) => {
    const engines = [
        { name: 'Google Indexing API', key: 'google', icon: Search, color: 'text-blue-400' },
        { name: 'IndexNow (Bing/Yandex)', key: 'bing', icon: Globe, color: 'text-green-400' },
        { name: 'Privacy (Brave/Mojeek)', key: 'brave', icon: Shield, color: 'text-orange-400' }
    ];

    let domain = post.originalUrl;
    try {
        domain = new URL(post.originalUrl).hostname;
    } catch (e) {
        // fallback
    }

    return (
        <div className="max-w-3xl mx-auto mt-16 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-vertex-success/20 text-vertex-success mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Mission Accomplished</h2>
                <p className="text-xl text-slate-400">Phase 4: Global Publishing & Indexing Complete</p>
            </div>

            <Card className="p-8 mb-8 border-vertex-success/30">
                <div className="flex items-center gap-3 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Server className="text-vertex-primary" size={24} />
                    <div>
                        <div className="text-sm text-slate-400">Successfully posted on behalf of:</div>
                        <div className="font-medium text-white">{domain}</div>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Live URL</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <a href={post.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-vertex-primary hover:underline truncate flex-1 text-lg">
                            {post.publishedUrl}
                        </a>
                        <ExternalLink className="text-slate-500" size={20} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-4">Indexing Status</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {engines.map((engine) => {
                            const Icon = engine.icon;
                            return (
                                <div key={engine.key} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <Icon className={engine.color} size={24} />
                                    <div>
                                        <div className="text-sm font-medium text-white">{engine.name}</div>
                                        <div className="text-xs text-vertex-success flex items-center gap-1 mt-1">
                                            <CheckCircle size={12} /> Submitted
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg text-sm text-blue-200">
                    <strong>Agent Log:</strong> Post published successfully to {domain}. Dual-track content (SEO + GEO) generated. FAQ JSON-LD schema injected. Expect Google indexing within 5-30 minutes.
                </div>
            </Card>

            <div className="text-center">
                <Button onClick={onReset} variant="outline" className="px-8 py-3">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start New Workflow
                </Button>
            </div>
        </div>
    );
};

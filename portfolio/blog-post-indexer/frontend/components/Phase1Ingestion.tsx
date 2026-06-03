import React, { useState } from 'react';
import { Search, Link as LinkIcon, Zap } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';

interface Props {
    onSubmit: (url: string, keywords: string[]) => void;
    isProcessing: boolean;
}

export const Phase1Ingestion: React.FC<Props> = ({ onSubmit, isProcessing }) => {
    const [url, setUrl] = useState('');
    const [keywords, setKeywords] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !keywords) return;
        onSubmit(url, keywords.split(',').map(k => k.trim()));
    };

    return (
        <div className="max-w-2xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vertex-primary/20 text-vertex-primary mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <Zap size={32} />
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Autonomous Content Agent
                </h1>
                <p className="text-slate-400 mt-3 text-lg">Phase 1: Ingestion & Discovery</p>
            </div>

            <Card className="p-8 border-t-4 border-t-vertex-primary">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target URL</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="url"
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-vertex-primary focus:border-transparent transition-all"
                                placeholder="https://yourdomain.com/target-page"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Keywords (comma separated)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                required
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-vertex-primary focus:border-transparent transition-all"
                                placeholder="vertex ai, machine learning, content generation"
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full py-3 text-lg" 
                        isLoading={isProcessing}
                    >
                        {isProcessing ? 'Mining SERP Data...' : 'Initialize Workflow'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

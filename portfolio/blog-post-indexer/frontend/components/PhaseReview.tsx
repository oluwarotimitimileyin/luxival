import React, { useState } from 'react';
import { Globe, FileText, Code, Send, ArrowLeft, Server } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { DraftContent } from '../types.ts';

interface Props {
    draft: DraftContent;
    originalUrl: string;
    onPublish: () => void;
    onCancel: () => void;
}

export const PhaseReview: React.FC<Props> = ({ draft, originalUrl, onPublish, onCancel }) => {
    const [activeTab, setActiveTab] = useState<'seo' | 'geo' | 'schema'>('seo');
    
    let domain = originalUrl;
    try {
        domain = new URL(originalUrl).hostname;
    } catch (e) {
        // fallback
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Review Generated Content</h2>
                    <p className="text-slate-400">Review the dual-track content before publishing to your CMS.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
                    <Server className="text-vertex-primary" size={20} />
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Target CMS Connection</div>
                        <div className="text-sm font-medium text-white">{domain}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-slate-700 bg-slate-900/50">
                            <button 
                                onClick={() => setActiveTab('seo')}
                                className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'seo' ? 'bg-slate-800 text-vertex-primary border-b-2 border-vertex-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <FileText size={18} /> Track A (SEO / BLUF)
                            </button>
                            <button 
                                onClick={() => setActiveTab('geo')}
                                className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'geo' ? 'bg-slate-800 text-vertex-primary border-b-2 border-vertex-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <Globe size={18} /> Track B (GEO / Tables)
                            </button>
                            <button 
                                onClick={() => setActiveTab('schema')}
                                className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'schema' ? 'bg-slate-800 text-vertex-primary border-b-2 border-vertex-primary' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                            >
                                <Code size={18} /> FAQ Schema
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto flex-1 bg-slate-900/30">
                            {activeTab === 'seo' && (
                                <div className="animate-in fade-in">
                                    <h1 className="text-3xl font-extrabold text-white mb-8">{draft.title}</h1>
                                    <div dangerouslySetInnerHTML={{ __html: draft.contentSEO }} />
                                </div>
                            )}
                            {activeTab === 'geo' && (
                                <div className="animate-in fade-in">
                                    <h1 className="text-3xl font-extrabold text-white mb-8">{draft.title} (Localized)</h1>
                                    <div dangerouslySetInnerHTML={{ __html: draft.contentGEO }} />
                                </div>
                            )}
                            {activeTab === 'schema' && (
                                <div className="animate-in fade-in h-full">
                                    <p className="text-slate-400 mb-4">This JSON-LD schema will be injected into the document head for rich search results.</p>
                                    <pre className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-green-400 text-sm overflow-x-auto font-mono">
                                        {draft.faqSchema}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card className="p-6 border-vertex-primary/30 bg-vertex-primary/5">
                        <h3 className="text-lg font-bold text-white mb-4">Publishing Checklist</h3>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <div className="mt-0.5 text-vertex-success">✓</div>
                                70% SERP Data Integrated
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <div className="mt-0.5 text-vertex-success">✓</div>
                                30% Human Insights Applied
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <div className="mt-0.5 text-vertex-success">✓</div>
                                All Mention Gaps Filled
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-300">
                                <div className="mt-0.5 text-vertex-success">✓</div>
                                FAQ Schema Generated
                            </li>
                        </ul>

                        <div className="space-y-3">
                            <Button 
                                onClick={onPublish} 
                                className="w-full py-3 text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Publish to {domain}
                            </Button>
                            <Button 
                                onClick={onCancel} 
                                variant="outline" 
                                className="w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Editing
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Post-Publish Actions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Globe className="text-blue-400" size={16} />
                                Submit to Google Indexing API
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Globe className="text-green-400" size={16} />
                                Ping IndexNow (Bing/Yandex)
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <Globe className="text-orange-400" size={16} />
                                Notify Privacy Engines
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useCallback } from 'react';
import { AppState, GapQuestion, SessionData, PublishedPost, DraftContent } from './types.ts';
import { mockIngestion, mockSynthesis, mockPublishing } from './services/mockApi.ts';
import { Phase1Ingestion } from './components/Phase1Ingestion.tsx';
import { Phase2QualityGate } from './components/Phase2QualityGate.tsx';
import { Phase3Synthesis } from './components/Phase3Synthesis.tsx';
import { PhaseReview } from './components/PhaseReview.tsx';
import { Phase4Publishing } from './components/Phase4Publishing.tsx';
import { Bot, Loader2 } from 'lucide-react';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [draftContent, setDraftContent] = useState<DraftContent | null>(null);
    const [publishedPost, setPublishedPost] = useState<PublishedPost | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleIngestionSubmit = useCallback(async (url: string, keywords: string[]) => {
        setIsProcessing(true);
        try {
            // Phase 1: Ingestion
            const questions = await mockIngestion(url, keywords);
            setSessionData({ url, keywords, questions, answers: {} });
            // Transition to Phase 2
            setAppState(AppState.INTERVIEW);
        } catch (error) {
            console.error("Ingestion failed", error);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleQualityGateSubmit = useCallback(async (answers: Record<string, string>) => {
        if (!sessionData) return;
        
        // Update session with answers
        setSessionData(prev => prev ? { ...prev, answers } : null);
        
        // Transition to Phase 3 (Drafting)
        setAppState(AppState.DRAFTING);
        
        try {
            // Phase 3: Synthesis
            const draft = await mockSynthesis(answers, sessionData.url);
            setDraftContent(draft);
            
            // Transition to Review state
            setAppState(AppState.REVIEW);
        } catch (error) {
            console.error("Synthesis failed", error);
        }
    }, [sessionData]);

    const handlePublish = useCallback(async () => {
        if (!sessionData || !draftContent) return;

        setAppState(AppState.PUBLISHING);
        
        try {
            // Phase 4: Publishing
            const post = await mockPublishing(sessionData.url);
            setPublishedPost(post);
            
            // Transition to Published state
            setAppState(AppState.PUBLISHED);
        } catch (error) {
            console.error("Publishing failed", error);
            // In a real app, handle SLEEP state on quota errors here
        }
    }, [sessionData, draftContent]);

    const handleCancelReview = useCallback(() => {
        setAppState(AppState.INTERVIEW);
    }, []);

    const resetWorkflow = useCallback(() => {
        setAppState(AppState.IDLE);
        setSessionData(null);
        setDraftContent(null);
        setPublishedPost(null);
    }, []);

    return (
        <div className="min-h-screen bg-vertex-dark text-slate-200 font-sans selection:bg-vertex-primary/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="text-vertex-primary" size={28} />
                        <span className="font-bold text-xl tracking-tight text-white">Vertex AI <span className="text-slate-400 font-normal">Content Agent</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="relative flex h-3 w-3">
                                {appState === AppState.SLEEP ? (
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-vertex-warning"></span>
                                ) : (
                                    <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vertex-success opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-vertex-success"></span>
                                    </>
                                )}
                            </span>
                            <span className="text-slate-400 font-mono uppercase tracking-wider">
                                STATE: {AppState[appState]}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="px-4 sm:px-6 lg:px-8 py-8">
                {appState === AppState.IDLE && (
                    <Phase1Ingestion 
                        onSubmit={handleIngestionSubmit} 
                        isProcessing={isProcessing} 
                    />
                )}

                {appState === AppState.INTERVIEW && sessionData && (
                    <Phase2QualityGate 
                        questions={sessionData.questions} 
                        onSubmit={handleQualityGateSubmit} 
                    />
                )}

                {appState === AppState.DRAFTING && (
                    <Phase3Synthesis />
                )}

                {appState === AppState.REVIEW && draftContent && sessionData && (
                    <PhaseReview 
                        draft={draftContent}
                        originalUrl={sessionData.url}
                        onPublish={handlePublish}
                        onCancel={handleCancelReview}
                    />
                )}

                {appState === AppState.PUBLISHING && (
                    <div className="max-w-2xl mx-auto mt-32 text-center animate-in fade-in">
                        <Loader2 className="w-16 h-16 text-vertex-primary animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Publishing to CMS...</h2>
                        <p className="text-slate-400">Connecting to {new URL(sessionData?.url || 'https://example.com').hostname} and submitting to indexing APIs.</p>
                    </div>
                )}

                {appState === AppState.PUBLISHED && publishedPost && (
                    <Phase4Publishing 
                        post={publishedPost} 
                        onReset={resetWorkflow} 
                    />
                )}
            </main>
        </div>
    );
};

export default App;

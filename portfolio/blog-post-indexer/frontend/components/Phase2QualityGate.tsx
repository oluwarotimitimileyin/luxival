import React, { useState, useEffect, useRef } from 'react';
import { Mic, FileText, Upload, CheckCircle2, AlertCircle, PlaySquare } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { GapQuestion } from '../types.ts';

interface Props {
    questions: GapQuestion[];
    onSubmit: (answers: Record<string, string>) => void;
}

export const Phase2QualityGate: React.FC<Props> = ({ questions, onSubmit }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    // Mock speech recognition
    const recordingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const answeredCount = Object.values(answers).filter(a => a.trim().length >= 10).length;
        setProgress((answeredCount / questions.length) * 100);
    }, [answers, questions.length]);

    const handleAnswerChange = (id: string, text: string) => {
        setAnswers(prev => ({ ...prev, [id]: text }));
    };

    const toggleRecording = (id: string) => {
        if (recordingId === id) {
            // Stop recording
            setRecordingId(null);
            if (recordingTimeoutRef.current) {
                window.clearTimeout(recordingTimeoutRef.current);
            }
        } else {
            // Start recording mock
            setRecordingId(id);
            // Simulate speech to text after a delay
            recordingTimeoutRef.current = window.setTimeout(() => {
                handleAnswerChange(id, (answers[id] || '') + " [Transcribed audio: Based on our internal data, we see a 40% increase in efficiency when implementing this specific strategy.]");
                setRecordingId(null);
            }, 3000);
        }
    };

    const handleFileUpload = (id: string) => {
        // Mock file upload
        handleAnswerChange(id, (answers[id] || '') + "\n[Attached Reference: internal_research_q3_2026.pdf - Extracted key points regarding market gaps.]");
    };

    const isComplete = progress === 100;

    return (
        <div className="max-w-5xl mx-auto mt-10 pb-20 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="text-vertex-warning animate-pulse" />
                        <h2 className="text-2xl font-bold text-white">Phase 2: Quality Gate Paused</h2>
                    </div>
                    <p className="text-slate-400">Human expertise required to fill content gaps before synthesis.</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-vertex-primary">{Math.round(progress)}%</div>
                    <div className="text-sm text-slate-400">Completion</div>
                </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-10 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q, index) => {
                    const isAnswered = (answers[q.id]?.trim().length || 0) >= 10;
                    const isRecording = recordingId === q.id;

                    return (
                        <Card key={q.id} className={`p-6 flex flex-col transition-all duration-300 ${isAnswered ? 'border-vertex-success/50 bg-vertex-success/5' : 'border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold text-sm">
                                    Q{index + 1}
                                </span>
                                {isAnswered && <CheckCircle2 className="text-vertex-success" />}
                            </div>
                            
                            <h3 className="text-lg font-medium text-white mb-4 flex-grow">
                                {q.text}
                            </h3>

                            <div className="space-y-4 mt-auto">
                                <textarea
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Type your insights here..."
                                    className="w-full h-32 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-vertex-primary focus:border-transparent resize-none"
                                />
                                
                                <div className="flex gap-2">
                                    <Button 
                                        variant={isRecording ? 'danger' : 'outline'} 
                                        className={`flex-1 ${isRecording ? 'animate-pulse' : ''}`}
                                        onClick={() => toggleRecording(q.id)}
                                    >
                                        <Mic className="w-4 h-4 mr-2" />
                                        {isRecording ? 'Recording...' : 'Voice'}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => handleFileUpload(q.id)}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        PDF/Doc
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12 text-center">
                <Button 
                    size="lg" 
                    className="px-12 py-4 text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                    disabled={!isComplete}
                    onClick={() => onSubmit(answers)}
                >
                    <PlaySquare className="w-5 h-5 mr-2" />
                    Proceed to Phase 3: Synthesis
                </Button>
                {!isComplete && (
                    <p className="text-slate-500 mt-4 text-sm">
                        * All 4 questions must be answered (min 10 chars) to unlock synthesis.
                    </p>
                )}
            </div>
        </div>
    );
};

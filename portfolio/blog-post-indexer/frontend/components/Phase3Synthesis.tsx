import React, { useEffect, useState } from 'react';
import { Cpu, FileCode2, Globe2, Database } from 'lucide-react';
import { Card } from './ui/Card.tsx';

export const Phase3Synthesis: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        { icon: Database, title: "Blending Data", desc: "70% SERP + 30% Human Insights" },
        { icon: FileCode2, title: "Track A (SEO)", desc: "Generating BLUF format, 1500 words" },
        { icon: Globe2, title: "Track B (GEO)", desc: "Building comparison tables & FAQ Schema" },
        { icon: Cpu, title: "Finalizing", desc: "Applying semantic HTML5 markup" }
    ];

    return (
        <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in duration-500">
            <div className="relative inline-flex mb-12">
                <div className="absolute inset-0 bg-vertex-accent blur-3xl opacity-20 rounded-full"></div>
                <Cpu size={64} className="text-vertex-accent animate-pulse relative z-10" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Phase 3: Dual-Track Synthesis</h2>
            <p className="text-slate-400 mb-12">Agent is drafting content based on your expertise.</p>

            <Card className="p-8 text-left bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const isActive = index === activeStep;
                        const isDone = index < activeStep;
                        const Icon = step.icon;

                        return (
                            <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'opacity-100 scale-105' : isDone ? 'opacity-50' : 'opacity-20'}`}>
                                <div className={`p-3 rounded-lg ${isActive ? 'bg-vertex-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isDone ? 'bg-vertex-success text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h4 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{step.title}</h4>
                                    <p className="text-sm text-slate-400">{step.desc}</p>
                                </div>
                                {isActive && (
                                    <div className="ml-auto flex gap-1">
                                        <div className="w-2 h-2 bg-vertex-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-vertex-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-vertex-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

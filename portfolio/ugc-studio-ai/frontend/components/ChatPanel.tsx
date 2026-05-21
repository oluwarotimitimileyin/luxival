import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types.ts';
import { Send, Bot, User, Mic, MicOff, ImagePlus, X } from 'lucide-react';
import { Markdown } from './Shared.tsx';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, imageBase64?: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isTyping, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || isTyping) return;
    
    onSendMessage(input.trim(), attachedImage || undefined);
    setInput('');
    setAttachedImage(null);
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Filter out system messages from the UI
  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white leading-tight">UGC Production Agent</h2>
          <p className="text-xs text-brand-400">Online • Ready to create</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {visibleMessages.length === 0 && !isTyping && (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Initializing agent...
          </div>
        )}
        
        {visibleMessages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-slate-700' : 'bg-brand-900/50 border border-brand-500/30'}`}>
              {msg.role === 'user' ? <User size={16} className="text-slate-300" /> : <Bot size={16} className="text-brand-400" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-sm' 
                : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm'}`}>
              
              {msg.image && (
                <img src={msg.image} alt="Uploaded reference" className="w-48 h-auto object-cover rounded-lg mb-2 border border-white/20" />
              )}
              
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <Markdown content={msg.text} />
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-900/50 border border-brand-500/30 flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} className="text-brand-400" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
        {attachedImage && (
          <div className="mb-3 relative inline-block">
            <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-700" />
            <button 
              onClick={() => setAttachedImage(null)}
              className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 hover:text-white rounded-full p-1 border border-slate-600"
            >
              <X size={12} />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="w-10 h-10 shrink-0 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            title="Upload reference image"
          >
            <ImagePlus size={18} />
          </button>
          
          <button
            type="button"
            onClick={toggleListen}
            disabled={isTyping}
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-50
              ${isListening ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 transition-all"
          />
          
          <button
            type="submit"
            disabled={(!input.trim() && !attachedImage) || isTyping}
            className="absolute right-2 w-8 h-8 bg-brand-600 hover:bg-brand-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Paperclip, Loader2, Bot, User, Mic, MicOff, Volume2 } from 'lucide-react';
import { Message, AgentConfig } from '../types';
import { streamChatResponse, fileToBase64, ai } from '../services/gemini';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';

interface ChatWidgetProps {
  config: AgentConfig;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Voice Mode State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef<string>('');
  const currentOutputTranscriptionRef = useRef<string>('');

  // Initialize greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'model',
          text: config.greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [config.greeting, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isVoiceMode]);

  // Cleanup voice session on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: input,
      timestamp: new Date(),
      imageUrl: imagePreview || undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    let base64Image: string | undefined;
    let mimeType: string | undefined;

    if (selectedImage) {
      try {
        base64Image = await fileToBase64(selectedImage);
        mimeType = selectedImage.type;
      } catch (e) {
        console.error("Failed to process image", e);
      }
    }
    
    removeImage();

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: modelMsgId, role: 'model', text: '', timestamp: new Date() }
    ]);

    try {
      const historyToPass = messages.filter(m => m.id !== 'greeting'); 
      const stream = streamChatResponse(historyToPass, newUserMessage.text, config, base64Image, mimeType);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: "Sorry, I encountered an error." } : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Live API Voice Implementation ---
  const startVoiceSession = async () => {
    setIsVoiceConnecting(true);
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      
      nextStartTimeRef.current = 0;
      sourcesRef.current = new Set();

      const sessionPromise = ai.live.connect({
        model: 'gemini-live-2.5-flash-native-audio',
        callbacks: {
          onopen: () => {
            setIsVoiceMode(true);
            setIsVoiceConnecting(false);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscriptionRef.current.trim();
              const fullOutput = currentOutputTranscriptionRef.current.trim();
              
              if (fullInput || fullOutput) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (fullInput) {
                    newMsgs.push({ id: `v-in-${Date.now()}`, role: 'user', text: fullInput, timestamp: new Date() });
                  }
                  if (fullOutput) {
                    newMsgs.push({ id: `v-out-${Date.now()}`, role: 'model', text: fullOutput, timestamp: new Date() });
                  }
                  return newMsgs;
                });
              }
              
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            // Handle Audio Output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                ctx,
                24000,
                1,
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            setVoiceError("Connection error occurred.");
            stopVoiceSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live API Closed');
            stopVoiceSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: config.systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start voice session:", err);
      setVoiceError("Could not access microphone.");
      setIsVoiceConnecting(false);
    }
  };

  const stopVoiceSession = useCallback(() => {
    setIsVoiceMode(false);
    setIsVoiceConnecting(false);
    
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        if (session && typeof session.close === 'function') {
          session.close();
        }
      }).catch(console.error);
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }

    for (const source of sourcesRef.current.values()) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[550px] flex flex-col mb-4 border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right">
          {/* Header */}
          <div 
            className="p-4 text-white flex justify-between items-center"
            style={{ backgroundColor: config.primaryColor }}
          >
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <span className="font-semibold">{config.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              {isVoiceMode && (
                <span className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full mr-2 animate-pulse">
                  <Volume2 size={12} className="mr-1" /> Live
                </span>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 ml-2' : 'bg-vortex-100 mr-2'}`}>
                    {msg.role === 'user' ? <User size={16} className="text-gray-600" /> : <Bot size={16} className="text-vortex-600" />}
                  </div>
                  <div 
                    className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-gray-900 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="max-w-full rounded-lg mb-2" />
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {msg.text || (isTyping && msg.role === 'model' ? <span className="animate-pulse">...</span> : '')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Voice Mode Overlay */}
            {isVoiceMode && (
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-end pb-4 pointer-events-none">
                <div className="flex items-center space-x-2 text-vortex-600 font-medium bg-white px-4 py-2 rounded-full shadow-md border border-vortex-100 pointer-events-auto">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-4 bg-vortex-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-6 bg-vortex-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-4 bg-vortex-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="ml-2 text-sm">Listening...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            {voiceError && (
              <div className="text-xs text-red-500 mb-2 px-2">{voiceError}</div>
            )}
            {imagePreview && !isVoiceMode && (
              <div className="relative inline-block mb-2">
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-gray-300" />
                <button 
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              {isVoiceMode ? (
                <button
                  onClick={stopVoiceSession}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2.5 flex items-center justify-center font-medium transition-colors border border-red-200"
                >
                  <MicOff size={18} className="mr-2" /> End Voice Chat
                </button>
              ) : (
                <>
                  <div className="flex-1 bg-gray-100 rounded-xl border border-transparent focus-within:border-vortex-500 focus-within:bg-white transition-colors flex items-center px-3 py-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[24px] text-sm py-1"
                      rows={1}
                      disabled={isTyping || isVoiceConnecting}
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      disabled={isTyping || isVoiceConnecting}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      disabled={isTyping || isVoiceConnecting}
                    >
                      <Paperclip size={18} />
                    </button>
                  </div>
                  
                  {input.trim() || selectedImage ? (
                    <button
                      onClick={handleSend}
                      disabled={isTyping}
                      className="p-3 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  ) : (
                    <button
                      onClick={startVoiceSession}
                      disabled={isVoiceConnecting}
                      className="p-3 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0 border border-gray-200"
                      title="Start Voice Chat"
                    >
                      {isVoiceConnecting ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full shadow-xl text-white hover:scale-105 transition-transform duration-200 flex items-center justify-center"
        style={{ backgroundColor: config.primaryColor }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};
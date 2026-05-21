import React, { useReducer, useEffect, useRef } from 'react';
import { AppState, Action } from './types.ts';
import { ChatPanel } from './components/ChatPanel.tsx';
import { MediaPanel } from './components/MediaPanel.tsx';
import { sendChatMessage, generateAssets, generateVideo } from './services/ai.ts';
import { AlertCircle } from 'lucide-react';

const initialState: AppState = {
  messages: [],
  isTyping: false,
  generatedImages: [],
  videoUrl: null,
  error: null,
  mediaStatus: null
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_IMAGES':
      return { ...state, generatedImages: action.payload };
    case 'SET_VIDEO':
      return { ...state, videoUrl: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MEDIA_STATUS':
      return { ...state, mediaStatus: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const generatedImagesRef = useRef<string[]>([]);

  // Keep ref updated for async access
  useEffect(() => {
    generatedImagesRef.current = state.generatedImages;
  }, [state.generatedImages]);

  const handleAiResponse = async (text: string) => {
    // Regex to find JSON blocks. Handles optional whitespace.
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    
    let displayText = text;
    let command = null;

    if (match) {
      try {
        command = JSON.parse(match[1]);
        // Remove the JSON block from the text shown to the user
        displayText = text.replace(jsonRegex, '').trim();
      } catch (e) {
        console.error("Failed to parse command from AI response", e);
      }
    }

    // Add the visible part of the AI's message
    if (displayText) {
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { id: Date.now().toString(), role: 'model', text: displayText } 
      });
    }

    // Execute command if found
    if (command) {
      if (command.action === 'generate_images') {
        dispatch({ type: 'SET_MEDIA_STATUS', payload: 'Generating character assets (this takes a moment)...' });
        try {
          const images = await generateAssets(command.prompt);
          dispatch({ type: 'SET_IMAGES', payload: images });
          dispatch({ type: 'SET_MEDIA_STATUS', payload: null });
          
          // Inform AI of success
          const reply = await sendChatMessage("SYSTEM: Images generated successfully. Proceed to the next step.");
          handleAiResponse(reply);
        } catch (e: any) {
          dispatch({ type: 'SET_MEDIA_STATUS', payload: null });
          dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to generate images.' });
          const reply = await sendChatMessage("SYSTEM: Image generation failed. Apologize to the user and ask if they want to try again.");
          handleAiResponse(reply);
        }
      } else if (command.action === 'generate_video') {
        dispatch({ type: 'SET_MEDIA_STATUS', payload: 'Rendering final video (this may take a few minutes)...' });
        try {
          const refImage = generatedImagesRef.current[0];
          const videoUrl = await generateVideo(command.prompt, refImage);
          dispatch({ type: 'SET_VIDEO', payload: videoUrl });
          dispatch({ type: 'SET_MEDIA_STATUS', payload: null });
          
          // Inform AI of success
          const reply = await sendChatMessage("SYSTEM: Video generated successfully. Proceed to the next step.");
          handleAiResponse(reply);
        } catch (e: any) {
          dispatch({ type: 'SET_MEDIA_STATUS', payload: null });
          dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to generate video.' });
          const reply = await sendChatMessage("SYSTEM: Video generation failed. Apologize to the user and ask if they want to try again.");
          handleAiResponse(reply);
        }
      }
    } else {
      // If no command, we are done typing
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  // Initialize chat on mount
  useEffect(() => {
    let mounted = true;
    const startChat = async () => {
      dispatch({ type: 'SET_TYPING', payload: true });
      try {
        // Send a hidden system message to kick off the conversation based on the prompt instructions
        const reply = await sendChatMessage("SYSTEM: Hello! Please start the conversation exactly as instructed in the START section.");
        if (mounted) handleAiResponse(reply);
      } catch (e: any) {
        if (mounted) {
          dispatch({ type: 'SET_TYPING', payload: false });
          dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to initialize chat.' });
        }
      }
    };
    startChat();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { id: Date.now().toString(), role: 'user', text, image: imageBase64 } 
    });
    dispatch({ type: 'SET_TYPING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const reply = await sendChatMessage(text, imageBase64);
      handleAiResponse(reply);
    } catch (e: any) {
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to send message.' });
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden selection:bg-brand-500/30">
      {/* Left Panel: Chat Interface */}
      <div className="w-full md:w-5/12 lg:w-1/3 border-r border-slate-800 flex flex-col relative z-10 shadow-2xl">
        <ChatPanel 
          messages={state.messages} 
          isTyping={state.isTyping} 
          onSendMessage={handleSendMessage} 
        />
      </div>

      {/* Right Panel: Media Canvas */}
      <div className="hidden md:flex flex-1 flex-col relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        {state.error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md p-4 bg-red-900/90 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-100 shadow-xl animate-in slide-in-from-top-4">
            <AlertCircle className="shrink-0 mt-0.5 text-red-400" size={20} />
            <div>
              <h4 className="font-semibold text-red-200 text-sm">System Error</h4>
              <p className="text-xs mt-1">{state.error}</p>
            </div>
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="ml-auto text-red-400 hover:text-red-200">×</button>
          </div>
        )}

        <MediaPanel state={state} />
      </div>
    </div>
  );
}

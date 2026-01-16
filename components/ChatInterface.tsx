import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppConfig, ChatMessage, UserProfile } from '../types';
import { initializeChat, sendMessageToGemini, synthesizeSpeech } from '../services/geminiService';
import { playAudioBuffer, stopAudio } from '../utils/audioUtils';
import { clearSession, saveSession } from '../utils/storage';

interface ChatInterfaceProps {
  config: AppConfig;
  profile: UserProfile;
  initialMessages?: ChatMessage[];
  onExit: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ config, profile, initialMessages = [], onExit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save session
  useEffect(() => {
    if (messages.length > 0) {
        saveSession({
            config,
            profile,
            messages,
            lastActive: Date.now()
        });
    }
  }, [messages, config, profile]);

  // Initialize Chat
  useEffect(() => {
    const init = async () => {
      try {
        // Pass existing history to initialization so the model remembers
        await initializeChat(config, profile, initialMessages);
        
        // Only trigger welcome if there is no history
        if (initialMessages.length === 0) {
            setIsLoading(true);
            const response = await sendMessageToGemini("Hello mentor, I am ready to start. Please introduce yourself briefly based on my profile and the dashboard settings.");
            
            const welcomeMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: 'mentor',
              text: response.markdownResponse,
              speechText: response.speechResponse
            };
            setMessages([welcomeMsg]);
            setIsLoading(false);
            
            // Auto-play welcome audio
            handlePlayAudio(welcomeMsg);
        } else {
             // If resuming, just scroll down and be ready
             // We do NOT play audio for history to save time and be less annoying
        }

      } catch (error) {
        console.error("Initialization failed", error);
        setIsLoading(false);
      } finally {
        setInitialized(true);
      }
    };
    if (!initialized) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const handlePlayAudio = async (msg: ChatMessage) => {
    if (!msg.speechText || isPlaying) return;
    
    setIsPlaying(true);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isAudioPlaying: true } : m));

    try {
      const audioBuffer = await synthesizeSpeech(msg.speechText, config.voice);
      await playAudioBuffer(audioBuffer);
    } catch (error) {
      console.error("Audio playback error", error);
    } finally {
      setIsPlaying(false);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isAudioPlaying: false } : m));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Stop any current audio to respect "valuable time"
    if (isPlaying) {
        stopAudio();
        setIsPlaying(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMsg.text);
      const mentorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'mentor',
        text: response.markdownResponse,
        speechText: response.speechResponse
      };
      setMessages(prev => [...prev, mentorMsg]);
      handlePlayAudio(mentorMsg);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'mentor',
        text: "**System Error:** Connection disrupted. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearAndExit = () => {
    if(window.confirm("Are you sure? This will delete your learning history.")) {
        clearSession();
        onExit();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-gray-300 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-cyber-dim flex justify-between items-center bg-cyber-dark z-10">
        <div>
          <h2 className="text-xl font-bold text-white font-mono">
            <span className="text-cyber-green mr-2">●</span>
            CYBER_MENTOR v2.5
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
             MODE: {config.track} | VOICE: {config.voice}
          </p>
        </div>
        <div className="flex items-center space-x-4">
             <div className={`text-xs font-mono px-3 py-1 rounded border ${isPlaying ? 'border-cyber-green text-cyber-green animate-pulse' : 'border-gray-700 text-gray-600'}`}>
                {isPlaying ? "TRANSMITTING" : "STANDBY"}
            </div>
            <button 
                onClick={handleClearAndExit}
                className="text-xs text-red-500 hover:text-red-400 font-mono border border-red-900/50 hover:border-red-500 px-3 py-1 rounded transition-colors"
            >
                RESET_SESSION
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-lg p-4 ${
                msg.sender === 'user'
                  ? 'bg-cyber-dim text-white border border-gray-600'
                  : 'bg-[#0a1f0f] text-gray-200 border border-cyber-green/30'
              }`}
            >
              {msg.sender === 'mentor' && (
                <div className="flex items-center mb-2 border-b border-white/10 pb-1">
                   <span className="text-xs font-mono text-cyber-green uppercase mr-2">Mentor</span>
                   {msg.isAudioPlaying && (
                       <div className="flex space-x-0.5 h-3 items-end">
                           <div className="w-0.5 bg-cyber-green h-2 animate-[bounce_1s_infinite]"></div>
                           <div className="w-0.5 bg-cyber-green h-3 animate-[bounce_1.2s_infinite]"></div>
                           <div className="w-0.5 bg-cyber-green h-1 animate-[bounce_0.8s_infinite]"></div>
                       </div>
                   )}
                </div>
              )}
              
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.sender === 'mentor' && !msg.isAudioPlaying && !isPlaying && (
                 <button 
                  onClick={() => handlePlayAudio(msg)}
                  className="mt-2 text-xs text-gray-500 hover:text-cyber-green flex items-center gap-1 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Replay
                 </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[#0a1f0f] border border-cyber-green/30 rounded-lg p-4 flex items-center space-x-3">
                 <div className="w-2 h-2 bg-cyber-green rounded-full animate-ping"></div>
                 <span className="font-mono text-sm text-cyber-green">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-cyber-dim">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your question..."
            rows={1}
            className="w-full bg-cyber-gray text-white rounded-lg pl-4 pr-12 py-4 border border-cyber-dim focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none resize-none overflow-hidden"
            style={{ minHeight: '60px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2.5 p-2 text-cyber-green hover:bg-cyber-green/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2 font-mono">
            AI can make mistakes. Verify critical commands.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;

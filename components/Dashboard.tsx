import React, { useState, useEffect } from 'react';
import { Accent, AppConfig, LearningTrack, SpeakingSpeed, VoicePersona, SavedSession } from '../types';
import { loadSession } from '../utils/storage';

interface DashboardProps {
  onComplete: (config: AppConfig) => void;
  onResume: (session: SavedSession) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onComplete, onResume }) => {
  const [config, setConfig] = useState<AppConfig>({
    accent: Accent.INDIAN,
    voice: VoicePersona.KORE,
    speed: SpeakingSpeed.NORMAL,
    track: LearningTrack.UNSURE,
  });
  
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (session) {
        setSavedSession(session);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(config);
  };

  const voiceOptions = [
    { id: VoicePersona.PUCK, label: 'Puck (Male - Standard)' },
    { id: VoicePersona.CHARON, label: 'Charon (Male - Deep)' },
    { id: VoicePersona.FENRIR, label: 'Fenrir (Male - Intense)' },
    { id: VoicePersona.KORE, label: 'Kore (Female - Calm)' },
    { id: VoicePersona.ZEPHYR, label: 'Zephyr (Female - Soft)' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans text-cyber-gray-light">
      <div className="w-full max-w-lg bg-cyber-gray border border-cyber-dim p-8 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-green to-transparent"></div>
        
        <h1 className="text-3xl font-bold text-white mb-2 font-mono tracking-tighter">
          <span className="text-cyber-green">&gt;</span> SYSTEM CONFIG
        </h1>
        <p className="text-sm text-gray-400 mb-8 font-mono">
          Initialize your learning environment parameters.
        </p>

        {savedSession && (
             <div className="mb-8 p-4 bg-cyber-green/5 border border-cyber-green/30 rounded-lg">
                <h3 className="text-cyber-green font-bold text-sm uppercase mb-2">Previous Session Detected</h3>
                <p className="text-xs text-gray-400 mb-4">
                    User: <span className="text-white">{savedSession.profile.name}</span> | 
                    Track: <span className="text-white">{savedSession.config.track}</span>
                </p>
                <button 
                    onClick={() => onResume(savedSession)}
                    className="w-full bg-cyber-green text-black font-bold py-3 rounded hover:bg-green-400 transition-colors uppercase text-sm"
                >
                    Resume Last Session
                </button>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-600">or configure new session below</span>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Accent Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-cyber-green uppercase tracking-wider">Accent</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.values(Accent).map((accent) => (
                <button
                  key={accent}
                  type="button"
                  onClick={() => setConfig({ ...config, accent })}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                    config.accent === accent
                      ? 'bg-cyber-green/10 border-cyber-green text-cyber-green'
                      : 'bg-black border-cyber-dim text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {accent}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Persona Selection */}
          <div className="space-y-2">
             <label className="block text-xs font-bold text-cyber-green uppercase tracking-wider">Voice Persona</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {voiceOptions.map((voiceOption) => (
                   <button
                   key={voiceOption.id}
                   type="button"
                   onClick={() => setConfig({...config, voice: voiceOption.id})}
                   className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border text-left flex flex-col ${
                    config.voice === voiceOption.id
                      ? 'bg-cyber-green/10 border-cyber-green text-cyber-green'
                      : 'bg-black border-cyber-dim text-gray-400 hover:border-gray-500'
                   }`}
                   >
                    <span>{voiceOption.label}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* Speed */}
          <div className="space-y-2">
             <label className="block text-xs font-bold text-cyber-green uppercase tracking-wider">Speaking Speed</label>
             <div className="flex space-x-2">
                {Object.values(SpeakingSpeed).map((speed) => (
                   <button
                   key={speed}
                   type="button"
                   onClick={() => setConfig({...config, speed: speed})}
                   className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                    config.speed === speed
                      ? 'bg-cyber-green/10 border-cyber-green text-cyber-green'
                      : 'bg-black border-cyber-dim text-gray-400 hover:border-gray-500'
                   }`}
                   >
                    {speed}
                   </button>
                ))}
             </div>
          </div>

          {/* Track */}
          <div className="space-y-2">
             <label className="block text-xs font-bold text-cyber-green uppercase tracking-wider">Learning Track</label>
             <div className="flex flex-col space-y-2">
                {Object.values(LearningTrack).map((track) => (
                   <button
                   key={track}
                   type="button"
                   onClick={() => setConfig({...config, track: track})}
                   className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                    config.track === track
                      ? 'bg-cyber-green/10 border-cyber-green text-cyber-green'
                      : 'bg-black border-cyber-dim text-gray-400 hover:border-gray-500'
                   }`}
                   >
                    {track}
                   </button>
                ))}
             </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-lg transition-colors font-mono tracking-widest uppercase border border-cyber-dim"
          >
            Start New Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

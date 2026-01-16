import React, { useState } from 'react';
import { AppConfig, AppStage, UserProfile, SavedSession } from './types';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.DASHBOARD);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);

  const handleDashboardComplete = (cfg: AppConfig) => {
    setConfig(cfg);
    setStage(AppStage.ONBOARDING);
  };

  const handleResumeSession = (session: SavedSession) => {
    setConfig(session.config);
    setProfile(session.profile);
    setInitialMessages(session.messages);
    setStage(AppStage.MENTORING);
  };

  const handleOnboardingComplete = (prof: UserProfile) => {
    setProfile(prof);
    setStage(AppStage.MENTORING);
  };

  const handleExitChat = () => {
    setStage(AppStage.DASHBOARD);
    setConfig(null);
    setProfile(null);
    setInitialMessages([]);
  };

  if (!process.env.API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono p-4 text-center">
        <div>
          <h1 className="text-red-500 text-xl font-bold mb-4">CRITICAL ERROR: API KEY MISSING</h1>
          <p>Please provide a valid Google Gemini API Key in the environment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {stage === AppStage.DASHBOARD && (
        <Dashboard 
            onComplete={handleDashboardComplete} 
            onResume={handleResumeSession}
        />
      )}
      
      {stage === AppStage.ONBOARDING && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {stage === AppStage.MENTORING && config && profile && (
        <ChatInterface 
            config={config} 
            profile={profile} 
            initialMessages={initialMessages}
            onExit={handleExitChat}
        />
      )}
    </>
  );
};

export default App;

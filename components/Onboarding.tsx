import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    education: '',
    goal: 'Red Team', // Default from previous, but editable here if needed or just displayed
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.age && profile.education) {
        onComplete(profile);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans">
      <div className="w-full max-w-lg bg-cyber-gray border border-cyber-dim p-8 rounded-xl shadow-2xl relative">
        <h1 className="text-2xl font-bold text-white mb-6 font-mono">
          <span className="text-cyber-green">Identify</span> User
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase font-mono">Codename / Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full bg-black border border-cyber-dim text-white p-3 rounded focus:border-cyber-green focus:outline-none transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase font-mono">Age</label>
            <input
              type="number"
              required
              value={profile.age}
              onChange={(e) => setProfile({...profile, age: e.target.value})}
              className="w-full bg-black border border-cyber-dim text-white p-3 rounded focus:border-cyber-green focus:outline-none transition-colors"
              placeholder="e.g. 24"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase font-mono">Background (Tech/Non-Tech)</label>
             <select 
                value={profile.education}
                onChange={(e) => setProfile({...profile, education: e.target.value})}
                className="w-full bg-black border border-cyber-dim text-white p-3 rounded focus:border-cyber-green focus:outline-none transition-colors"
             >
                <option value="" disabled>Select Background</option>
                <option value="CS/IT Engineering">CS/IT Engineering</option>
                <option value="BCA/MCA">BCA/MCA</option>
                <option value="Non-Tech Degree">Non-Tech Degree</option>
                <option value="Student">Student (School/College)</option>
                <option value="Working Professional">Working Professional (IT)</option>
                <option value="Working Professional Non-IT">Working Professional (Non-IT)</option>
             </select>
          </div>

           <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase font-mono">Specific Goal</label>
            <input
              type="text"
              required
              value={profile.goal}
              onChange={(e) => setProfile({...profile, goal: e.target.value})}
              className="w-full bg-black border border-cyber-dim text-white p-3 rounded focus:border-cyber-green focus:outline-none transition-colors"
              placeholder="e.g. Become a Penetration Tester"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg transition-colors font-mono uppercase"
          >
            Establish Connection
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;

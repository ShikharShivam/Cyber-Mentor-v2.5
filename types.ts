export enum AppStage {
  DASHBOARD = 'DASHBOARD',
  ONBOARDING = 'ONBOARDING',
  MENTORING = 'MENTORING',
}

export enum Accent {
  INDIAN = 'Indian English',
  AMERICAN = 'American English',
  BRITISH = 'British English',
}

export enum VoicePersona {
  PUCK = 'Puck',
  CHARON = 'Charon',
  KORE = 'Kore',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr',
}

export enum SpeakingSpeed {
  SLOW = 'Slow',
  NORMAL = 'Normal',
  FAST = 'Fast',
}

export enum LearningTrack {
  RED_TEAM = 'Red Team',
  BLUE_TEAM = 'Blue Team',
  UNSURE = 'Not Sure (Guide Me)',
}

export interface AppConfig {
  accent: Accent;
  voice: VoicePersona;
  speed: SpeakingSpeed;
  track: LearningTrack;
}

export interface UserProfile {
  name: string;
  age: string;
  education: string;
  goal: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string; // Markdown display text
  speechText?: string; // Clean text for TTS
  isAudioPlaying?: boolean;
}

export interface SavedSession {
  config: AppConfig;
  profile: UserProfile;
  messages: ChatMessage[];
  lastActive: number;
}

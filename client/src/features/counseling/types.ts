export type SafetyLevel = 'none' | 'crisis_support' | 'boundary_redirect';
export type MessageSource = 'llm' | 'fallback' | 'canned';

export interface ChatSession {
  id: string;
  title: string;
  status: 'active' | 'closed';
  ageGroup: string;
  safetyFlags: string[];
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  safetyLevel: SafetyLevel;
  source: MessageSource;
  createdAt: string;
}

export interface CrisisResource {
  region: string;
  name: string;
  contact: string;
}

export interface CounselingIntro {
  disclaimer: string;
  crisisResources: CrisisResource[];
  suggestedActivities: { code: string; title: string; description: string }[];
}

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface AiStatus {
  provider: string;
  configured: boolean;
}

import { nanoid } from 'nanoid';
import { saveAIMetadata, getAIDocumentsByAgent, getAllAIMetadata, type AIDocumentMetadata } from './hybrid-storage';

export type AgentType = 'nvidia-nim' | 'openai' | 'anthropic' | 'local-ollama' | 'custom';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  icon: string;
  color: string;
}

export const AI_AGENTS: Record<AgentType, AIAgent> = {
  'nvidia-nim': {
    id: 'nvidia-nim',
    name: 'NVIDIA NIM',
    type: 'nvidia-nim',
    icon: '🚀',
    color: '#76B900',
  },
  'openai': {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    icon: '🤖',
    color: '#10A37F',
  },
  'anthropic': {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    icon: '🧠',
    color: '#D97757',
  },
  'local-ollama': {
    id: 'local-ollama',
    name: 'Local Ollama',
    type: 'local-ollama',
    icon: '💻',
    color: '#4A90D9',
  },
  'custom': {
    id: 'custom',
    name: 'Custom Agent',
    type: 'custom',
    icon: '✨',
    color: '#9333EA',
  },
};

export interface GeneratedDocFolder {
  folderId: string;
  folderName: string;
  agentId: string;
  agentName: string;
  source: 'topic' | 'github' | 'website';
  prompt: string;
  generatedAt: string;
}

export async function createAgentFolder(
  agentType: AgentType,
  source: 'topic' | 'github' | 'website',
  prompt: string
): Promise<GeneratedDocFolder> {
  const agent = AI_AGENTS[agentType];
  const folderName = `${agent.icon} ${agent.name} - ${formatDate(new Date())}`;
  
  const metadata: AIDocumentMetadata = {
    id: nanoid(),
    agentId: agent.id,
    agentName: agent.name,
    generatedAt: new Date().toISOString(),
    source,
    prompt,
    syncedToSupabase: false,
    lastModified: new Date().toISOString(),
  };

  await saveAIMetadata(metadata);

  return {
    folderId: nanoid(),
    folderName,
    agentId: agent.id,
    agentName: agent.name,
    source,
    prompt,
    generatedAt: metadata.generatedAt,
  };
}

export async function getDocsByAgent(agentId: string): Promise<AIDocumentMetadata[]> {
  return getAIDocumentsByAgent(agentId);
}

export async function getAllAgentDocs(): Promise<AIDocumentMetadata[]> {
  return getAllAIMetadata();
}

export function getAgentById(agentId: string): AIAgent | undefined {
  return Object.values(AI_AGENTS).find(a => a.id === agentId);
}

export function getCurrentAgent(): AIAgent {
  const agentType = (import.meta.env.VITE_DEFAULT_AI_AGENT as AgentType) || 'nvidia-nim';
  return AI_AGENTS[agentType];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getAgentStats(): { agentId: string; agentName: string; docCount: number; icon: string; color: string }[] {
  const agents = Object.values(AI_AGENTS);
  
  return agents.map(agent => ({
    agentId: agent.id,
    agentName: agent.name,
    docCount: 0,
    icon: agent.icon,
    color: agent.color,
  }));
}

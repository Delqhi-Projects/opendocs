import { nanoid } from 'nanoid';
import { saveAIMetadata, getAIDocumentsByAgent, getAllAIMetadata, type AIDocumentMetadata } from './hybrid-storage';

export type AgentType = 'nvidia-nim' | 'openai' | 'anthropic' | 'local-ollama' | 'custom';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
}

export const AI_AGENTS: Record<AgentType, AIAgent> = {
  'nvidia-nim': { id: 'nvidia-nim', name: 'NVIDIA NIM', type: 'nvidia-nim' },
  'openai': { id: 'openai', name: 'OpenAI', type: 'openai' },
  'anthropic': { id: 'anthropic', name: 'Anthropic', type: 'anthropic' },
  'local-ollama': { id: 'local-ollama', name: 'Local Ollama', type: 'local-ollama' },
  'custom': { id: 'custom', name: 'Custom Agent', type: 'custom' },
};

export function getCurrentAgent(): AIAgent {
  const agentType = (import.meta.env.VITE_DEFAULT_AI_AGENT as AgentType) || 'nvidia-nim';
  return AI_AGENTS[agentType] || AI_AGENTS['nvidia-nim'];
}

export function getAgentById(agentId: string): AIAgent | undefined {
  return Object.values(AI_AGENTS).find(a => a.id === agentId);
}

export function extractFolderName(source: 'topic' | 'github' | 'website', input: string): string {
  if (source === 'topic') {
    return input;
  }
  if (source === 'github') {
    const parts = input.split('/');
    return parts[parts.length - 1] || 'GitHub Repo';
  }
  if (source === 'website') {
    try {
      const url = new URL(input);
      return url.hostname.replace('www.', '');
    } catch {
      return 'Website';
    }
  }
  return 'AI Generated';
}

export async function createAIMetadata(
  source: 'topic' | 'github' | 'website',
  prompt: string
): Promise<AIDocumentMetadata> {
  const agent = getCurrentAgent();
  const docId = nanoid();
  
  const metadata: AIDocumentMetadata = {
    id: docId,
    agentId: agent.id,
    agentName: agent.name,
    generatedAt: new Date().toISOString(),
    source,
    prompt,
    syncedToSupabase: false,
    lastModified: new Date().toISOString(),
  };

  await saveAIMetadata(metadata);
  return metadata;
}

export async function getDocsByAgent(agentId: string): Promise<AIDocumentMetadata[]> {
  return getAIDocumentsByAgent(agentId);
}

export async function getAllAgentDocs(): Promise<AIDocumentMetadata[]> {
  return getAllAIMetadata();
}

export async function getAgentStats(): Promise<{ agentId: string; agentName: string; docCount: number }[]> {
  const allDocs = await getAllAIMetadata();
  const agents = Object.values(AI_AGENTS);
  
  return agents.map(agent => ({
    agentId: agent.id,
    agentName: agent.name,
    docCount: allDocs.filter(d => d.agentId === agent.id).length,
  }));
}

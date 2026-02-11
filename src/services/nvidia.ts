import type { DocBlock, BlockType } from "@/types/docs";
import { postJson } from "@/services/apiClient";
import type { OpenDocsCommand } from "@/commands/commandTypes";

export type GeneratedDocs = {
  rootName?: string;
  folders: {
    name: string;
    pages: { title: string; blocks: Partial<DocBlock & { type: BlockType }>[]}[];
  }[];
};

export type AgentPlan = {
  reply: string;
  commands: OpenDocsCommand[];
};

type ChatCompletion = {
  choices?: { message?: { content?: string } }[];
};

function extractContent(llm: unknown): string {
  const c = llm as ChatCompletion;
  return c?.choices?.[0]?.message?.content ?? "";
}

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function nvidiaChatText(prompt: string, opts?: { system?: string; temperature?: number }): Promise<string> {
  const system =
    opts?.system ||
    "You are OpenDocs. Be concise, actionable, and prefer step-by-step instructions. Use Markdown.";

  const llm = await postJson<ChatCompletion>("/api/nvidia/chat", {
    temperature: opts?.temperature ?? 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  return extractContent(llm);
}

function docsSystem(language: string, depth: "simple" | "standard" | "deep") {
  return `You are OpenDocs. Create ultra-simple documentation best practices Feb 2026.\n\nOutput STRICT JSON only.\nSchema:\n{\n  \"rootName\": string,\n  \"folders\": [{\n    \"name\": string,\n    \"pages\": [{\n      \"title\": string,\n      \"blocks\": [{ \"type\": \"heading1\"|\"heading2\"|\"heading3\"|\"paragraph\"|\"code\"|\"table\"|\"callout\"|\"checklist\"|\"mermaid\"|\"quote\"|\"divider\"|\"image\"|\"video\"|\"link\"|\"file\", ... }]\n    }]\n  }]\n}\n\nRules:\n- Language: ${language}\n- Depth: ${depth}\n- Prefer few blocks, no overload.\n- Provide safe, correct links.\n- Include at least: Overview, Setup, Step-by-step, Troubleshooting, Best Practices 2026.\n`;
}

export async function generateFromTopic(topic: string, opts?: { language?: string; depth?: "simple" | "standard" | "deep" }): Promise<GeneratedDocs> {
  const language = opts?.language || "de";
  const depth = opts?.depth || "standard";

  const content = await nvidiaChatText(topic, { system: docsSystem(language, depth), temperature: 0.2 });
  const parsed = safeJson<GeneratedDocs>(content);
  if (parsed?.folders?.length) return parsed;

  return {
    rootName: topic,
    folders: [
      {
        name: "Generated",
        pages: [
          {
            title: `Guide: ${topic}`,
            blocks: [
              { type: "heading1", text: `Guide: ${topic}` } as any,
              { type: "paragraph", text: content } as any,
            ],
          },
        ],
      },
    ],
  };
}

export async function generateFromGitHub(url: string): Promise<GeneratedDocs> {
  const resp = await postJson<{ llm: ChatCompletion }>("/api/github/analyze", { url });
  const content = extractContent(resp.llm);
  const parsed = safeJson<GeneratedDocs>(content);
  if (parsed?.folders?.length) return parsed;
  return {
    rootName: "GitHub Repo",
    folders: [{ name: "Repo", pages: [{ title: "Overview", blocks: [{ type: "paragraph", text: content } as any] }] }],
  };
}

export async function generateFromWebsite(url: string): Promise<GeneratedDocs> {
  const resp = await postJson<{ llm: ChatCompletion }>("/api/website/analyze", { url });
  const content = extractContent(resp.llm);
  const parsed = safeJson<GeneratedDocs>(content);
  if (parsed?.folders?.length) return parsed;
  return {
    rootName: "Website",
    folders: [{ name: "Website", pages: [{ title: "Summary", blocks: [{ type: "paragraph", text: content } as any] }] }],
  };
}

export async function agentPlan(prompt: string, context: unknown): Promise<AgentPlan> {
  const resp = await postJson<{ llm: ChatCompletion }>("/api/agent/plan", { prompt, context });
  const content = extractContent(resp.llm);
  const parsed = safeJson<AgentPlan>(content);
  if (parsed && typeof parsed.reply === "string" && Array.isArray(parsed.commands)) return parsed;
  return { reply: content || "(No reply)", commands: [] };
}

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import type { AiPromptBlock } from "@/types/docs";
import { agentPlan } from "@/services/nvidia";
import { executeOpenDocsCommand } from "@/commands/executeCommand";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/blockHelpers";
import type { OpenDocsCommand } from "@/commands/commandTypes";

export function AiPromptBlockView({
  pageId,
  block,
  disabled,
  onDelete,
}: {
  pageId: string;
  block: AiPromptBlock;
  disabled: boolean;
  onDelete: () => void;
}) {
  const [prompt, setPrompt] = useState(block.prompt || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError("");

    try {
      const plan = await agentPlan(prompt, { 
        action: "create_block_at_position",
        context: `The user is on pageId: ${pageId}. They want to replace THIS AI Prompt block (blockId: ${block.id}) with the generated content. 
        You MUST propose a 'docs.block.insertAfter' command followed by a 'docs.block.delete' of the prompt block if you want to replace it, or just use 'docs.block.update' if appropriate.`
      });

      if (plan.commands && plan.commands.length > 0) {
        for (const cmd of plan.commands) {
          // Only add pageId if the command type supports it
          if ('pageId' in cmd) {
            const commandWithPageId = { ...cmd, pageId: cmd.pageId ?? pageId } as OpenDocsCommand;
            await executeOpenDocsCommand(commandWithPageId);
          } else {
            await executeOpenDocsCommand(cmd);
          }
        }
        // If the AI didn't delete the prompt block itself, we do it here.
        onDelete();
      } else {
        setError("AI couldn't generate a valid block for this prompt. Try being more specific.");
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/10">
      <div className="mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">AI Block Creator</span>
      </div>

      <div className="flex gap-2">
        <input
          disabled={disabled || busy}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void generate();
            }
          }}
          placeholder="e.g. 'Generate a table of 5 countries' or 'Write a guide for Vite'"
          className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <Button 
          onClick={() => void generate()} 
          disabled={disabled || busy || !prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {["Table of features", "Step-by-step setup", "Mermaid flow diagram", "Pricing checklist"].map(tag => (
          <button
            key={tag}
            disabled={busy || disabled}
            onClick={() => setPrompt(tag)}
            className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

import type { ParagraphBlock } from "@/types/docs";

export function ParagraphBlockView({
  block,
  disabled,
  onUpdate,
  onSlash,
}: {
  block: ParagraphBlock;
  disabled: boolean;
  onUpdate: (text: string) => void;
  onSlash: () => void;
}) {
  return (
    <textarea
      disabled={disabled}
      value={block.text}
      onChange={(e) => onUpdate(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "/" && (e.currentTarget.value ?? "") === "") {
          e.preventDefault();
          onSlash();
        }
      }}
      placeholder="Write… (type / to insert)"
      className="min-h-[72px] w-full resize-y bg-transparent text-sm leading-relaxed text-zinc-900 outline-none dark:text-zinc-100 disabled:opacity-70"
    />
  );
}

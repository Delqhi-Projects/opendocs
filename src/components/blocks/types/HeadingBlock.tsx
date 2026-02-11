import type { HeadingBlock } from "@/types/docs";

export function HeadingBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: HeadingBlock;
  disabled: boolean;
  onUpdate: (text: string) => void;
}) {
  const cls =
    block.type === "heading1"
      ? "text-3xl font-bold tracking-tight"
      : block.type === "heading2"
        ? "text-2xl font-bold tracking-tight"
        : "text-xl font-bold tracking-tight";

  return (
    <input
      disabled={disabled}
      value={block.text}
      onChange={(e) => onUpdate(e.target.value)}
      className={`w-full bg-transparent outline-none ${cls} text-zinc-900 dark:text-zinc-100 disabled:opacity-70`}
      placeholder="Heading"
    />
  );
}

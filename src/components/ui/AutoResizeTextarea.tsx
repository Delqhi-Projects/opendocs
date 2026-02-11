import { useRef, useEffect } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSlash?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AutoResizeTextarea({
  value,
  onChange,
  onSlash,
  disabled = false,
  placeholder = "",
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.max(24, textareaRef.current.scrollHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "/" && value === "" && onSlash) {
      e.preventDefault();
      onSlash();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none overflow-hidden bg-transparent p-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 transition-all duration-150 ease-out"
      style={{
        minHeight: "24px",
        height: "auto",
        lineHeight: "1.5",
      }}
    />
  );
}

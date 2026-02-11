import { useMemo } from "react";
import type { ImageBlock, VideoBlock } from "@/types/docs";
import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export function ImageBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: ImageBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<ImageBlock>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
          <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <input
          disabled={disabled}
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="Paste image URL..."
          className="flex-1 bg-transparent text-xs text-zinc-500 outline-none hover:text-zinc-900 dark:hover:text-zinc-100"
        />
      </div>
      {block.url ? (
        <img
          src={block.url}
          alt={block.alt || ""}
          className="max-h-[480px] w-full rounded-lg object-contain shadow-sm border border-zinc-100 dark:border-zinc-800"
        />
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <ImageIcon className="mb-2 h-8 w-8 text-zinc-300" />
          <p className="text-xs text-zinc-400 font-medium">Image Placeholder</p>
        </div>
      )}
    </div>
  );
}

export function VideoBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: VideoBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<VideoBlock>) => void;
}) {
  const embedUrl = useMemo(() => {
    const url = block.url;
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (u.hostname === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (u.hostname.includes("vimeo.com")) {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? `https://player.vimeo.com/video/${id}` : null;
      }
    } catch { return null; }
    return null;
  }, [block.url]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
          <VideoIcon className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <input
          disabled={disabled}
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="Paste YouTube/Vimeo URL..."
          className="flex-1 bg-transparent text-xs text-zinc-500 outline-none hover:text-zinc-900 dark:hover:text-zinc-100"
        />
      </div>
      {embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-zinc-800 shadow-lg">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title="Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <VideoIcon className="mb-2 h-8 w-8 text-zinc-300" />
          <p className="text-xs text-zinc-400 font-medium">Video Placeholder</p>
        </div>
      )}
    </div>
  );
}

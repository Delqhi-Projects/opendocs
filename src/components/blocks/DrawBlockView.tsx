import { useCallback, useEffect, useMemo, useState } from "react";
import type { DrawBlock, DocBlock } from "@/types/docs";

declare global {
  interface Window {
    ExcalidrawLib?: { Excalidraw: React.ComponentType<any> };
  }
}

const EXCALIDRAW_JS = "https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.production.min.js";
const EXCALIDRAW_CSS = "https://unpkg.com/@excalidraw/excalidraw/dist/excalidraw.min.css";
const EXCALIDRAW_JS_ID = "opendocs-excalidraw-js";
const EXCALIDRAW_CSS_ID = "opendocs-excalidraw-css";

function ensureExcalidrawAssets() {
  if (!document.getElementById(EXCALIDRAW_CSS_ID)) {
    const link = document.createElement("link");
    link.id = EXCALIDRAW_CSS_ID;
    link.rel = "stylesheet";
    link.href = EXCALIDRAW_CSS;
    document.head.appendChild(link);
  }
  if (!document.getElementById(EXCALIDRAW_JS_ID)) {
    const script = document.createElement("script");
    script.id = EXCALIDRAW_JS_ID;
    script.src = EXCALIDRAW_JS;
    script.async = true;
    document.body.appendChild(script);
  }
}

export function DrawBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: DrawBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<DocBlock>) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureExcalidrawAssets();
    const t = window.setInterval(() => {
      if (window.ExcalidrawLib?.Excalidraw) {
        setReady(true);
        window.clearInterval(t);
      }
    }, 100);
    return () => window.clearInterval(t);
  }, []);

  const initialData = useMemo(
    () => ({
      elements: block.data?.elements || [],
      appState: block.data?.appState || {},
      files: block.data?.files || {},
    }),
    [block.data]
  );

  const onChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: any, appState: any, files: any) => {
      if (disabled) return;
      onUpdate({ data: { elements, appState, files } } as any);
    },
    [disabled, onUpdate]
  );

  const Excalidraw = window.ExcalidrawLib?.Excalidraw;

  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {!ready || !Excalidraw ? (
        <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400">Loading Draw canvas…</div>
      ) : (
        <div className="h-full w-full">
          <Excalidraw
            initialData={initialData}
            onChange={onChange}
            viewModeEnabled={disabled}
            zenModeEnabled={false}
            gridModeEnabled={false}
            theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
          />
        </div>
      )}
    </div>
  );
}

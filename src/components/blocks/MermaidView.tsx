import { useEffect, useId, useState, useRef } from "react";
import DOMPurify from "dompurify";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

async function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  return mermaidPromise;
}

export function MermaidView({ code, dark }: { code: string; dark: boolean }) {
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const reactId = useId();
  const id = `mmd-${reactId.replace(/:/g, "-")}`;
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMermaid()
      .then((mermaid) => {
        if (cancelled) return;
        if (!initialized.current) {
          mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default" });
          initialized.current = true;
        }
        return mermaid.render(id, code);
      })
      .then((out) => {
        if (!cancelled && out) {
          setSvg(out.svg);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setSvg(`<pre class="text-red-500">${String(e)}</pre>`);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, dark, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Loading diagram...</span>
      </div>
    );
  }

  return (
    <div 
      className="overflow-x-auto" 
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg) }} 
    />
  );
}

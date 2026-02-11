import { useEffect, useMemo, useState } from "react";
import mermaid from "mermaid";

export function MermaidView({ code, dark }: { code: string; dark: boolean }) {
  const [svg, setSvg] = useState<string>("");

  const id = useMemo(() => `mmd-${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "default" });
    let cancelled = false;
    mermaid
      .render(id, code)
      .then((out) => {
        if (!cancelled) setSvg(out.svg);
      })
      .catch((e) => {
        if (!cancelled) setSvg(`<pre>${String(e)}</pre>`);
      });
    return () => {
      cancelled = true;
    };
  }, [code, dark, id]);

  return <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}

import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import DOMPurify from "dompurify";

export function MermaidView({ code, dark }: { code: string; dark: boolean }) {
  const [svg, setSvg] = useState<string>("");
  const reactId = useId();
  const id = `mmd-${reactId.replace(/:/g, "-")}`;

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

  return (
    /* eslint-disable-next-line react/no-danger */
    <div 
      className="overflow-x-auto" 
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg) }} 
    />
  );
}

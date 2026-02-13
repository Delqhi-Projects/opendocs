import React, { useState, useRef } from "react";
import DOMPurify from "dompurify";

export interface CodeBlockProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
}

const KEYWORDS = [
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "import",
  "export",
  "from",
  "class",
  "interface",
  "type",
  "async",
  "await",
  "try",
  "catch",
  "new",
  "this",
  "true",
  "false",
  "null",
  "undefined",
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  initialCode = '// Write your code here...\nconsole.log("Hello OpenDocs");',
  language = "typescript",
  readOnly = false,
  onCodeChange,
}) => {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string) => {
    let highlighted = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    highlighted = highlighted.replace(
      /(["'])(?:(?=(\\?))\2.)*?\1/g,
      '<span style="color: #ce9178">$&</span>',
    );

    highlighted = highlighted.replace(
      /(\/\/.*)/g,
      '<span style="color: #6a9955">$&</span>',
    );

    const keywordRegex = new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "g");
    highlighted = highlighted.replace(
      keywordRegex,
      '<span style="color: #569cd6">$&</span>',
    );

    highlighted = highlighted.replace(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g,
      '<span style="color: #dcdcaa">$&</span>',
    );

    return highlighted;
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 0,
        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "300px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 15px",
          borderBottom: "1px solid #1a1a1a",
          background: "#0f0f0f",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              color: "#00ff9d",
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            [CODE]
          </span>
          <span
            style={{
              color: "#666",
              fontSize: "12px",
              textTransform: "uppercase",
            }}
          >
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: copied ? "#00ff9d" : "#e0e0e0",
            padding: "4px 8px",
            fontSize: "10px",
            cursor: "pointer",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
        >
          {copied ? "[COPIED]" : "[COPY]"}
        </button>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "15px 10px",
            background: "#0f0f0f",
            borderRight: "1px solid #1a1a1a",
            color: "#444",
            textAlign: "right",
            fontSize: "13px",
            lineHeight: "1.5",
            userSelect: "none",
            minWidth: "40px",
          }}
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              padding: "15px",
              background: "transparent",
              color: "transparent",
              caretColor: "#fff",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "inherit",
              whiteSpace: "pre",
              zIndex: 1,
            }}
          />
          <pre
            ref={preRef}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              padding: "15px",
              margin: 0,
              background: "transparent",
              color: "#d4d4d4",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "inherit",
              whiteSpace: "pre",
              pointerEvents: "none",
              overflow: "hidden",
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightCode(code)) }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;

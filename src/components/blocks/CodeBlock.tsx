import React, { useState } from "react";

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    padding: "16px",
    borderRadius: 0,
    border: "1px solid #333",
    fontFamily: "monospace",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid #333",
    paddingBottom: "8px",
  },
  label: {
    color: "#00ff9d",
    textTransform: "uppercase" as const,
    fontSize: "0.75rem",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  editor: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    minHeight: "200px",
    position: "relative" as const,
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  textarea: {
    width: "100%",
    height: "100%",
    minHeight: "200px",
    backgroundColor: "transparent",
    color: "#e0e0e0",
    border: "none",
    outline: "none",
    padding: "16px",
    resize: "vertical" as const,
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
  },
  lineNumbers: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: "40px",
    backgroundColor: "#111",
    borderRight: "1px solid #333",
    color: "#555",
    textAlign: "right" as const,
    padding: "16px 8px",
    userSelect: "none" as const,
  },
};

export const CodeBlock: React.FC = () => {
  const [code, setCode] = useState(
    '// Write your code here...\nconsole.log("Hello OpenDocs");',
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[CODE EDITOR]</span>
        <div style={styles.label}>LANG: TYPESCRIPT</div>
      </div>

      <div style={styles.editor}>
        <textarea
          style={styles.textarea}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeBlock;

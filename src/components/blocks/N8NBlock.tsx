import React from "react";

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
  workflowArea: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    height: "200px",
    position: "relative" as const,
    overflow: "hidden",
    marginBottom: "16px",
  },
  node: {
    position: "absolute" as const,
    backgroundColor: "#1a1a1a",
    border: "1px solid #00ff9d",
    padding: "8px 12px",
    fontSize: "0.8rem",
    color: "#fff",
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    gap: "8px",
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    border: "1px solid #00ff9d",
    padding: "6px 12px",
    fontSize: "0.75rem",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    fontWeight: "bold",
  },
};

export const N8NBlock: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[N8N WORKFLOW]</span>
        <div style={styles.label}>STATUS: ACTIVE</div>
      </div>

      <div style={styles.workflowArea}>
        {/* Mock Nodes */}
        <div style={{ ...styles.node, top: "40px", left: "20px" }}>
          [WEBHOOK]
        </div>
        <div
          style={{
            position: "absolute",
            top: "55px",
            left: "100px",
            width: "40px",
            height: "1px",
            backgroundColor: "#333",
          }}
        />
        <div style={{ ...styles.node, top: "40px", left: "140px" }}>
          [TRANSFORM]
        </div>
        <div
          style={{
            position: "absolute",
            top: "55px",
            left: "230px",
            width: "40px",
            height: "1px",
            backgroundColor: "#333",
          }}
        />
        <div style={{ ...styles.node, top: "40px", left: "270px" }}>
          [POSTGRES]
        </div>
      </div>

      <div style={styles.controls}>
        <button style={styles.button}>EXECUTE WORKFLOW</button>
        <button style={styles.button}>EDIT NODES</button>
        <button style={styles.button}>VIEW LOGS</button>
      </div>
    </div>
  );
};

export default N8NBlock;

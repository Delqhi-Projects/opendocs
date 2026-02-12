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
  workerList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  worker: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    color: "#00ff9d",
    fontSize: "0.7rem",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
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

export const CaptchaWorkerPanel: React.FC = () => {
  const [workers, setWorkers] = useState([
    { id: "W-001", status: "ACTIVE", tasks: 124 },
    { id: "W-002", status: "IDLE", tasks: 0 },
    { id: "W-003", status: "ACTIVE", tasks: 89 },
  ]);

  const toggleWorker = (id: string) => {
    setWorkers(
      workers.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "ACTIVE" ? "IDLE" : "ACTIVE" }
          : w,
      ),
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[WORKER MANAGEMENT]</span>
        <div style={styles.label}>TOTAL: {workers.length}</div>
      </div>

      <div style={styles.workerList}>
        {workers.map((worker) => (
          <div key={worker.id} style={styles.worker}>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                {worker.id}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>
                TASKS: {worker.tasks}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  ...styles.status,
                  color: worker.status === "ACTIVE" ? "#00ff9d" : "#888",
                }}
              >
                {worker.status}
              </span>
              <button
                style={styles.button}
                onClick={() => toggleWorker(worker.id)}
              >
                {worker.status === "ACTIVE" ? "PAUSE" : "START"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaptchaWorkerPanel;

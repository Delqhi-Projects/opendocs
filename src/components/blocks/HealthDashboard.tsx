import React, { useState, useEffect } from "react";

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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  value: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#00ff9d",
    marginBottom: "4px",
  },
  metric: {
    fontSize: "0.7rem",
    color: "#888",
    textTransform: "uppercase" as const,
  },
  logArea: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    height: "150px",
    padding: "8px",
    overflowY: "auto" as const,
    fontSize: "0.75rem",
    color: "#aaa",
    fontFamily: "monospace",
  },
  logEntry: {
    marginBottom: "4px",
    borderBottom: "1px solid #111",
    paddingBottom: "2px",
  },
  statusOk: { color: "#00ff9d" },
  statusWarn: { color: "#ffcc00" },
  statusErr: { color: "#ff0055" },
};

export const HealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: "12%",
    memory: "4.2GB",
    uptime: "14d 2h",
    requests: "1.2k/s",
    errors: "0.01%",
    latency: "45ms",
  });

  const [logs] = useState([
    { time: "10:42:01", level: "INFO", msg: "System health check passed" },
    {
      time: "10:41:55",
      level: "WARN",
      msg: "High memory usage detected on worker-04",
    },
    { time: "10:41:30", level: "INFO", msg: "Backup completed successfully" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + "%",
        latency: Math.floor(Math.random() * 50 + 20) + "ms",
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[SYSTEM HEALTH]</span>
        <div style={styles.label}>OPTIMAL</div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.value}>{metrics.cpu}</div>
          <div style={styles.metric}>CPU LOAD</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{metrics.memory}</div>
          <div style={styles.metric}>MEMORY</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{metrics.uptime}</div>
          <div style={styles.metric}>UPTIME</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{metrics.requests}</div>
          <div style={styles.metric}>THROUGHPUT</div>
        </div>
        <div style={styles.card}>
          <div style={{ ...styles.value, color: "#ff0055" }}>
            {metrics.errors}
          </div>
          <div style={styles.metric}>ERROR RATE</div>
        </div>
        <div style={styles.card}>
          <div style={styles.value}>{metrics.latency}</div>
          <div style={styles.metric}>LATENCY</div>
        </div>
      </div>

      <div style={styles.header}>
        <span style={styles.label}>[EVENT LOGS]</span>
      </div>

      <div style={styles.logArea}>
        {logs.map((log, i) => (
          <div key={i} style={styles.logEntry}>
            <span style={{ color: "#555", marginRight: "8px" }}>
              [{log.time}]
            </span>
            <span
              style={{
                color:
                  log.level === "INFO"
                    ? "#00ff9d"
                    : log.level === "WARN"
                      ? "#ffcc00"
                      : "#ff0055",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              {log.level}
            </span>
            {log.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthDashboard;

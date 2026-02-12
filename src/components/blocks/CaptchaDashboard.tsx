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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  statCard: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    padding: "16px",
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#00ff9d",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "#888",
    textTransform: "uppercase" as const,
  },
  chartArea: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    height: "150px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#555",
    fontSize: "0.8rem",
  },
};

export const CaptchaDashboard: React.FC = () => {
  const [stats] = useState({
    solved: 1245,
    failed: 32,
    rate: "97.5%",
    earnings: "$12.45",
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[CAPTCHA METRICS]</span>
        <div style={styles.label}>LIVE</div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.solved}</div>
          <div style={styles.statLabel}>SOLVED</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.failed}</div>
          <div style={styles.statLabel}>FAILED</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.rate}</div>
          <div style={styles.statLabel}>SUCCESS RATE</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.earnings}</div>
          <div style={styles.statLabel}>EARNINGS</div>
        </div>
      </div>

      <div style={styles.chartArea}>[REAL-TIME PERFORMANCE GRAPH]</div>
    </div>
  );
};

export default CaptchaDashboard;

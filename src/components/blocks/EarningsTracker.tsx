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
  totalEarnings: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#00ff9d",
    marginBottom: "8px",
    textAlign: "center" as const,
  },
  subtext: {
    fontSize: "0.8rem",
    color: "#888",
    textAlign: "center" as const,
    marginBottom: "24px",
    textTransform: "uppercase" as const,
  },
  breakdown: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #222",
    paddingBottom: "8px",
  },
  source: {
    fontSize: "0.9rem",
    color: "#e0e0e0",
  },
  amount: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#00ff9d",
  },
  chartPlaceholder: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    height: "100px",
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#555",
    fontSize: "0.8rem",
  },
};

export const EarningsTracker: React.FC = () => {
  const [earnings] = useState({
    total: "$1,245.80",
    today: "+$42.50",
    sources: [
      { name: "CAPTCHA SOLVING", amount: "$450.20" },
      { name: "SURVEY COMPLETION", amount: "$320.50" },
      { name: "DATA ENTRY", amount: "$210.80" },
      { name: "REFERRALS", amount: "$264.30" },
    ],
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[REVENUE STREAM]</span>
        <div style={styles.label}>MONTHLY</div>
      </div>

      <div style={styles.totalEarnings}>{earnings.total}</div>
      <div style={styles.subtext}>TODAY: {earnings.today}</div>

      <div style={styles.breakdown}>
        {earnings.sources.map((source, i) => (
          <div key={i} style={styles.row}>
            <span style={styles.source}>{source.name}</span>
            <span style={styles.amount}>{source.amount}</span>
          </div>
        ))}
      </div>

      <div style={styles.chartPlaceholder}>[EARNINGS HISTORY GRAPH]</div>
    </div>
  );
};

export default EarningsTracker;

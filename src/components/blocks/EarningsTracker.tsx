import React, { useState } from "react";

export interface EarningSource {
  name: string;
  amount: number;
}

export interface EarningsData {
  total: number;
  today: number;
  sources: EarningSource[];
  history: number[];
}

export interface EarningsTrackerProps {
  data?: EarningsData;
}

const mockData: EarningsData = {
  total: 1245.8,
  today: 42.5,
  sources: [
    { name: "CAPTCHA SOLVING", amount: 450.2 },
    { name: "SURVEY COMPLETION", amount: 320.5 },
    { name: "DATA ENTRY", amount: 210.8 },
    { name: "REFERRALS", amount: 264.3 },
  ],
  history: [50, 80, 60, 90, 120, 100, 140, 130, 160, 150, 180, 200],
};

export const EarningsTracker: React.FC<EarningsTrackerProps> = ({
  data = mockData,
}) => {
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderChart = () => {
    const max = Math.max(...data.history, 200);
    const min = 0;
    const width = 100;
    const height = 50;
    const points = data.history
      .map(
        (val, i) =>
          `${(i / (data.history.length - 1)) * width},${
            height - ((val - min) / (max - min)) * height
          }`,
      )
      .join(" ");

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="earningsGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00ff9d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M0,${height} ${points} L${width},${height} Z`}
          fill="url(#earningsGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#00ff9d"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {data.history.map((val, i) => (
          <circle
            key={i}
            cx={(i / (data.history.length - 1)) * width}
            cy={height - ((val - min) / (max - min)) * height}
            r="2"
            fill="#0a0a0a"
            stroke="#00ff9d"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    );
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 0,
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #1a1a1a",
          paddingBottom: "15px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#00ff9d",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          [REVENUE STREAM]
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: "transparent",
                border: "none",
                color: period === p ? "#00ff9d" : "#666",
                fontSize: "12px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: period === p ? "bold" : "normal",
                padding: 0,
              }}
            >
              [{p.toUpperCase()}]
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#00ff9d",
            marginBottom: "5px",
            letterSpacing: "-1px",
          }}
        >
          {formatCurrency(data.total)}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          TODAY:{" "}
          <span style={{ color: "#fff" }}>+{formatCurrency(data.today)}</span>
        </div>
      </div>

      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid #1a1a1a",
          height: "120px",
          padding: "15px",
          marginBottom: "25px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            fontSize: "10px",
            color: "#666",
            textTransform: "uppercase",
          }}
        >
          GROWTH TREND
        </div>
        <div style={{ width: "100%", height: "100%", paddingTop: "15px" }}>
          {renderChart()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.sources.map((source, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #1a1a1a",
              paddingBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#e0e0e0",
                textTransform: "uppercase",
              }}
            >
              {source.name}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#00ff9d",
              }}
            >
              {formatCurrency(source.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsTracker;

import React, { useState, useEffect } from "react";

export interface CaptchaStats {
  solved: number;
  failed: number;
  rate: number;
  earnings: number;
  history: number[];
}

export interface CaptchaDashboardProps {
  stats?: CaptchaStats;
}

const mockStats: CaptchaStats = {
  solved: 1245,
  failed: 32,
  rate: 97.5,
  earnings: 12.45,
  history: [20, 35, 45, 30, 55, 65, 40, 50, 70, 85, 60, 75, 90, 80, 95],
};

export const CaptchaDashboard: React.FC<CaptchaDashboardProps> = ({
  stats = mockStats,
}) => {
  const [data, setData] = useState(stats.history);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 60) + 40];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderChart = () => {
    const max = Math.max(...data, 100);
    const min = 0;
    const width = 100;
    const height = 50;
    const points = data
      .map(
        (val, i) =>
          `${(i / (data.length - 1)) * width},${
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
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00ff9d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M0,${height} ${points} L${width},${height} Z`}
          fill="url(#chartGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#00ff9d"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((val, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * width}
            cy={height - ((val - min) / (max - min)) * height}
            r="1.5"
            fill="#0a0a0a"
            stroke="#00ff9d"
            strokeWidth="0.5"
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
          [CAPTCHA METRICS]
        </h3>
        <div
          style={{
            color: "#00ff9d",
            fontSize: "12px",
            textTransform: "uppercase",
            animation: "pulse 2s infinite",
          }}
        >
          ● LIVE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "5px",
            }}
          >
            {stats.solved}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            SOLVED
          </div>
        </div>
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#ff0000",
              marginBottom: "5px",
            }}
          >
            {stats.failed}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            FAILED
          </div>
        </div>
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#00ff9d",
              marginBottom: "5px",
            }}
          >
            {stats.rate}%
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            SUCCESS RATE
          </div>
        </div>
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "5px",
            }}
          >
            ${stats.earnings}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            EARNINGS
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid #1a1a1a",
          height: "150px",
          padding: "10px",
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
          PERFORMANCE (RPM)
        </div>
        <div style={{ width: "100%", height: "100%", paddingTop: "20px" }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default CaptchaDashboard;

import React, { useState, useEffect } from "react";

export interface SystemMetrics {
  cpu: number;
  memory: number;
  uptime: string;
  requests: number;
  errors: number;
  latency: number;
  cpuHistory: number[];
  memoryHistory: number[];
}

export interface HealthDashboardProps {
  metrics?: SystemMetrics;
}

const mockMetrics: SystemMetrics = {
  cpu: 12,
  memory: 42,
  uptime: "14d 2h 15m",
  requests: 1250,
  errors: 0.01,
  latency: 45,
  cpuHistory: [10, 15, 12, 20, 25, 18, 15, 12, 10, 14, 16, 12, 10, 8, 12],
  memoryHistory: [40, 41, 42, 42, 43, 42, 41, 40, 40, 41, 42, 42, 41, 40, 42],
};

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  metrics: initialMetrics = mockMetrics,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newCpu = Math.floor(Math.random() * 30) + 5;
        const newMemory = Math.floor(Math.random() * 10) + 40;
        return {
          ...prev,
          cpu: newCpu,
          memory: newMemory,
          latency: Math.floor(Math.random() * 50 + 20),
          cpuHistory: [...prev.cpuHistory.slice(1), newCpu],
          memoryHistory: [...prev.memoryHistory.slice(1), newMemory],
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data: number[], color: string, maxVal: number = 100) => {
    const width = 100;
    const height = 40;
    const points = data
      .map(
        (val, i) =>
          `${(i / (data.length - 1)) * width},${
            height - (val / maxVal) * height
          }`,
      )
      .join(" ");

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${height} ${points} L${width},${height} Z`}
          fill={color}
          fillOpacity="0.2"
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
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
          [SYSTEM HEALTH]
        </h3>
        <div
          style={{
            color: "#00ff9d",
            fontSize: "12px",
            textTransform: "uppercase",
          }}
        >
          STATUS: OPTIMAL
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              CPU LOAD
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}
            >
              {metrics.cpu}%
            </span>
          </div>
          <div style={{ height: "40px" }}>
            {renderChart(metrics.cpuHistory, "#00ff9d")}
          </div>
        </div>

        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#666",
                textTransform: "uppercase",
              }}
            >
              MEMORY
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}
            >
              {metrics.memory}%
            </span>
          </div>
          <div style={{ height: "40px" }}>
            {renderChart(metrics.memoryHistory, "#0088ff")}
          </div>
        </div>

        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            UPTIME
          </div>
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#00ff9d" }}
          >
            {metrics.uptime}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
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
              fontSize: "20px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "5px",
            }}
          >
            {metrics.requests}/s
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            REQUESTS
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
              fontSize: "20px",
              fontWeight: "bold",
              color: "#ff0055",
              marginBottom: "5px",
            }}
          >
            {metrics.errors}%
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            ERROR RATE
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
              fontSize: "20px",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: "5px",
            }}
          >
            {metrics.latency}ms
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            LATENCY
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;

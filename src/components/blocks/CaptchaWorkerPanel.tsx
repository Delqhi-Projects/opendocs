import React, { useState } from "react";

export interface Worker {
  id: string;
  name: string;
  status: "active" | "idle" | "paused" | "error";
  tasksCompleted: number;
  successRate: number;
  lastActive: string;
}

export interface CaptchaWorkerPanelProps {
  workers?: Worker[];
  onToggleWorker?: (id: string) => void;
}

const mockWorkers: Worker[] = [
  {
    id: "w-1",
    name: "Worker Alpha",
    status: "active",
    tasksCompleted: 1245,
    successRate: 98.5,
    lastActive: "Now",
  },
  {
    id: "w-2",
    name: "Worker Beta",
    status: "idle",
    tasksCompleted: 850,
    successRate: 99.1,
    lastActive: "5m ago",
  },
  {
    id: "w-3",
    name: "Worker Gamma",
    status: "paused",
    tasksCompleted: 2300,
    successRate: 97.8,
    lastActive: "1h ago",
  },
  {
    id: "w-4",
    name: "Worker Delta",
    status: "error",
    tasksCompleted: 45,
    successRate: 0,
    lastActive: "2d ago",
  },
];

export const CaptchaWorkerPanel: React.FC<CaptchaWorkerPanelProps> = ({
  workers: initialWorkers = mockWorkers,
  onToggleWorker,
}) => {
  const [workers, setWorkers] = useState(initialWorkers);

  const handleToggle = (id: string) => {
    if (onToggleWorker) {
      onToggleWorker(id);
    } else {
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status:
                  w.status === "active"
                    ? "paused"
                    : w.status === "paused"
                      ? "active"
                      : w.status,
              }
            : w,
        ),
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#00ff9d";
      case "idle":
        return "#e0e0e0";
      case "paused":
        return "#ffaa00";
      case "error":
        return "#ff0000";
      default:
        return "#666";
    }
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
          [WORKER PANEL]
        </h3>
        <div
          style={{
            color: "#666",
            fontSize: "12px",
            textTransform: "uppercase",
          }}
        >
          ACTIVE: {workers.filter((w) => w.status === "active").length} /{" "}
          {workers.length}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {workers.map((worker) => (
          <div
            key={worker.id}
            style={{
              background: "#0f0f0f",
              border: "1px solid #1a1a1a",
              padding: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = getStatusColor(
                worker.status,
              ))
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#1a1a1a")
            }
          >
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {worker.name}
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    border: `1px solid ${getStatusColor(worker.status)}`,
                    color: getStatusColor(worker.status),
                    textTransform: "uppercase",
                  }}
                >
                  [{worker.status}]
                </span>
              </div>
              <div
                style={{
                  color: "#666",
                  fontSize: "12px",
                  display: "flex",
                  gap: "15px",
                }}
              >
                <span>TASKS: {worker.tasksCompleted}</span>
                <span>RATE: {worker.successRate}%</span>
                <span>LAST: {worker.lastActive}</span>
              </div>
            </div>

            <button
              onClick={() => handleToggle(worker.id)}
              disabled={worker.status === "error"}
              style={{
                background: "transparent",
                border: `1px solid ${
                  worker.status === "active" ? "#ffaa00" : "#00ff9d"
                }`,
                color: worker.status === "active" ? "#ffaa00" : "#00ff9d",
                padding: "6px 12px",
                fontSize: "10px",
                cursor: worker.status === "error" ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                fontWeight: "bold",
                opacity: worker.status === "error" ? 0.5 : 1,
                minWidth: "80px",
              }}
            >
              {worker.status === "active" ? "[PAUSE]" : "[START]"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaptchaWorkerPanel;

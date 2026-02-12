import React, { useState, useCallback } from "react";

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodesCount: number;
  lastExecuted?: string;
  status: "active" | "inactive" | "error";
  tags: string[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running";
  startedAt: string;
  duration: string;
}

export interface N8nBlockProps {
  workflows?: N8nWorkflow[];
  onExecute?: (workflowId: string) => Promise<void>;
  onToggleActive?: (workflowId: string, active: boolean) => void;
  onViewDetails?: (workflowId: string) => void;
}

const mockWorkflows: N8nWorkflow[] = [
  {
    id: "1",
    name: "Email Automation",
    active: true,
    nodesCount: 5,
    lastExecuted: "2023-10-27 10:30:00",
    status: "active",
    tags: ["email", "marketing"],
  },
  {
    id: "2",
    name: "Data Sync Postgres",
    active: false,
    nodesCount: 12,
    lastExecuted: "2023-10-26 15:45:00",
    status: "inactive",
    tags: ["database", "sync"],
  },
  {
    id: "3",
    name: "Webhook Handler",
    active: true,
    nodesCount: 3,
    lastExecuted: "2023-10-27 11:15:00",
    status: "error",
    tags: ["webhook", "api"],
  },
];

const mockExecutions: N8nExecution[] = [
  {
    id: "exec-1",
    workflowId: "1",
    status: "success",
    startedAt: "2023-10-27 10:30:00",
    duration: "1.2s",
  },
  {
    id: "exec-2",
    workflowId: "3",
    status: "error",
    startedAt: "2023-10-27 11:15:00",
    duration: "0.5s",
  },
];

export const N8NBlock: React.FC<N8nBlockProps> = ({
  workflows = mockWorkflows,
  onExecute,
  onToggleActive,
  onViewDetails,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "details" | "logs">(
    "list",
  );
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null,
  );
  const [executingId, setExecutingId] = useState<string | null>(null);

  const handleExecute = useCallback(
    async (id: string) => {
      setExecutingId(id);
      if (onExecute) {
        await onExecute(id);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setExecutingId(null);
    },
    [onExecute],
  );

  const handleViewDetails = (id: string) => {
    setSelectedWorkflowId(id);
    setActiveTab("details");
    onViewDetails?.(id);
  };

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

  const containerStyle = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: 0,
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    color: "#e0e0e0",
    minHeight: "400px",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: "15px",
  };

  const titleStyle = {
    margin: 0,
    color: "#00ff9d",
    fontSize: "16px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  };

  const tabButtonStyle = (isActive: boolean) => ({
    padding: "8px 16px",
    background: isActive ? "#00ff9d" : "#1a1a1a",
    border: "1px solid",
    borderColor: isActive ? "#00ff9d" : "#333",
    color: isActive ? "#050505" : "#e0e0e0",
    cursor: "pointer",
    borderRadius: 0,
    fontSize: "12px",
    textTransform: "uppercase" as const,
    fontWeight: "bold" as const,
    marginRight: "10px",
  });

  const listHeaderStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr",
    padding: "10px",
    borderBottom: "1px solid #333",
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const listItemStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr",
    padding: "12px 10px",
    borderBottom: "1px solid #1a1a1a",
    alignItems: "center",
    fontSize: "14px",
    transition: "background 0.2s",
  };

  const statusBadgeStyle = (status: string) => ({
    display: "inline-block",
    padding: "2px 6px",
    fontSize: "10px",
    border: `1px solid ${
      status === "active" ? "#00ff9d" : status === "error" ? "#ff0000" : "#666"
    }`,
    color:
      status === "active" ? "#00ff9d" : status === "error" ? "#ff0000" : "#666",
    textTransform: "uppercase" as const,
  });

  const actionButtonStyle = {
    padding: "4px 8px",
    background: "#1a1a1a",
    border: "1px solid #333",
    color: "#00ff9d",
    cursor: "pointer",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    marginRight: "5px",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>N8N Automation</h3>
        <div>
          <button
            style={tabButtonStyle(activeTab === "list")}
            onClick={() => setActiveTab("list")}
          >
            [WORKFLOWS]
          </button>
          <button
            style={tabButtonStyle(activeTab === "details")}
            onClick={() => selectedWorkflowId && setActiveTab("details")}
            disabled={!selectedWorkflowId}
            title={!selectedWorkflowId ? "Wähle einen Workflow" : ""}
          >
            [DETAILS]
          </button>
          <button
            style={tabButtonStyle(activeTab === "logs")}
            onClick={() => setActiveTab("logs")}
          >
            [LOGS]
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div>
          <div style={listHeaderStyle}>
            <div>Name</div>
            <div>Status</div>
            <div>Nodes</div>
            <div>Letzte Ausführung</div>
            <div>Aktionen</div>
          </div>
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              style={listItemStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#0f0f0f")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div style={{ fontWeight: "bold", color: "#fff" }}>
                {workflow.name}
                <div
                  style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}
                >
                  {workflow.tags.map((t) => `[${t}]`).join(" ")}
                </div>
              </div>
              <div>
                <span style={statusBadgeStyle(workflow.status)}>
                  [{workflow.status.toUpperCase()}]
                </span>
              </div>
              <div>{workflow.nodesCount}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {workflow.lastExecuted || "-"}
              </div>
              <div>
                <button
                  style={actionButtonStyle}
                  onClick={() => handleExecute(workflow.id)}
                  disabled={executingId === workflow.id}
                >
                  {executingId === workflow.id ? "[LÄUFT...]" : "[START]"}
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => handleViewDetails(workflow.id)}
                >
                  [VIEW]
                </button>
                <button
                  style={{
                    ...actionButtonStyle,
                    color: workflow.active ? "#ff0000" : "#666",
                    borderColor: workflow.active ? "#ff0000" : "#333",
                  }}
                  onClick={() =>
                    onToggleActive?.(workflow.id, !workflow.active)
                  }
                >
                  {workflow.active ? "[STOP]" : "[AKTIVIEREN]"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "details" && selectedWorkflow && (
        <div>
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "#0f0f0f",
              border: "1px solid #1a1a1a",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ margin: 0, color: "#fff" }}>
                {selectedWorkflow.name}
              </h4>
              <span style={statusBadgeStyle(selectedWorkflow.status)}>
                [{selectedWorkflow.status.toUpperCase()}]
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "15px",
                fontSize: "12px",
                color: "#888",
              }}
            >
              <div>
                <div style={{ color: "#00ff9d", marginBottom: "5px" }}>ID</div>
                {selectedWorkflow.id}
              </div>
              <div>
                <div style={{ color: "#00ff9d", marginBottom: "5px" }}>
                  NODES
                </div>
                {selectedWorkflow.nodesCount}
              </div>
              <div>
                <div style={{ color: "#00ff9d", marginBottom: "5px" }}>
                  TAGS
                </div>
                {selectedWorkflow.tags.join(", ")}
              </div>
            </div>
          </div>

          <div
            style={{
              height: "300px",
              background: "#000",
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#333",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "20%",
                transform: "translateY(-50%)",
                padding: "10px",
                border: "1px solid #00ff9d",
                color: "#00ff9d",
                fontSize: "12px",
              }}
            >
              [START]
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "35%",
                width: "15%",
                height: "1px",
                background: "#333",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: "10px",
                border: "1px solid #fff",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              [PROCESS]
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "35%",
                width: "15%",
                height: "1px",
                background: "#333",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "20%",
                transform: "translateY(-50%)",
                padding: "10px",
                border: "1px solid #666",
                color: "#666",
                fontSize: "12px",
              }}
            >
              [END]
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div>
          <div style={listHeaderStyle}>
            <div>Workflow ID</div>
            <div>Status</div>
            <div>Startzeit</div>
            <div>Dauer</div>
            <div>Details</div>
          </div>
          {mockExecutions.map((exec) => (
            <div key={exec.id} style={listItemStyle}>
              <div style={{ color: "#fff" }}>{exec.workflowId}</div>
              <div>
                <span style={statusBadgeStyle(exec.status)}>
                  [{exec.status.toUpperCase()}]
                </span>
              </div>
              <div style={{ color: "#888" }}>{exec.startedAt}</div>
              <div style={{ color: "#888" }}>{exec.duration}</div>
              <div>
                <button style={actionButtonStyle}>[LOG]</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default N8NBlock;

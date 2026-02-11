import React, { useState, useCallback } from "react";

export interface DatabaseConfig {
  id?: string;
  name: string;
  type: "postgresql" | "mysql" | "sqlite" | "mongodb";
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface DatabaseBlockProps {
  onConnect?: (config: DatabaseConfig) => Promise<void>;
  onDisconnect?: () => void;
  onTestConnection?: (config: DatabaseConfig) => Promise<boolean>;
  savedConnections?: DatabaseConfig[];
  onSaveConnection?: (config: DatabaseConfig) => void;
  onDeleteConnection?: (id: string) => void;
}

interface ConnectionStatus {
  connected: boolean;
  lastError?: string;
  lastConnected?: Date;
}

export const DatabaseBlock: React.FC<DatabaseBlockProps> = ({
  onConnect,
  onDisconnect,
  onTestConnection,
  savedConnections = [],
  onSaveConnection,
  onDeleteConnection,
}) => {
  const [activeTab, setActiveTab] = useState<"connect" | "saved">("connect");
  const [config, setConfig] = useState<DatabaseConfig>({
    name: "",
    type: "postgresql",
    host: "localhost",
    port: 5432,
    database: "",
    username: "",
    password: "",
    ssl: false,
  });
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const databaseTypes = [
    { value: "postgresql", label: "PostgreSQL", defaultPort: 5432 },
    { value: "mysql", label: "MySQL", defaultPort: 3306 },
    { value: "sqlite", label: "SQLite", defaultPort: 0 },
    { value: "mongodb", label: "MongoDB", defaultPort: 27017 },
  ];

  const handleTypeChange = (type: DatabaseConfig["type"]) => {
    const dbType = databaseTypes.find((t) => t.value === type);
    setConfig((prev) => ({
      ...prev,
      type,
      port: dbType?.defaultPort || 5432,
    }));
  };

  const handleConnect = useCallback(async () => {
    if (!onConnect) return;

    setIsConnecting(true);
    setStatus({ connected: false });

    try {
      await onConnect(config);
      setStatus({
        connected: true,
        lastConnected: new Date(),
      });
    } catch (error) {
      setStatus({
        connected: false,
        lastError: error instanceof Error ? error.message : "Connection failed",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [config, onConnect]);

  const handleTestConnection = useCallback(async () => {
    if (!onTestConnection) return;

    setIsTesting(true);

    try {
      const success = await onTestConnection(config);
      setStatus({
        connected: success,
        lastConnected: success ? new Date() : undefined,
        lastError: success ? undefined : "Test connection failed",
      });
    } catch (error) {
      setStatus({
        connected: false,
        lastError: error instanceof Error ? error.message : "Test failed",
      });
    } finally {
      setIsTesting(false);
    }
  }, [config, onTestConnection]);

  const handleSave = useCallback(() => {
    if (!onSaveConnection || !config.name) return;

    const saveConfig = editingId
      ? { ...config, id: editingId }
      : { ...config, id: Date.now().toString() };

    onSaveConnection(saveConfig);
    setEditingId(null);
  }, [config, editingId, onSaveConnection]);

  const loadConnection = (saved: DatabaseConfig) => {
    setConfig(saved);
    setEditingId(saved.id || null);
    setActiveTab("connect");
  };

  const clearForm = () => {
    setConfig({
      name: "",
      type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
      ssl: false,
    });
    setEditingId(null);
    setStatus({ connected: false });
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 15px",
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    color: "#e0e0e0",
    borderRadius: 0,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "#00ff9d",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    background: "#1a1a1a",
    border: "1px solid #333",
    color: "#e0e0e0",
    cursor: "pointer",
    borderRadius: 0,
    fontSize: "14px",
    transition: "all 0.2s",
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
          Datenbank Verbindung
        </h3>

        {status.connected && (
          <span
            style={{
              color: "#00ff9d",
              fontSize: "12px",
              padding: "4px 8px",
              background: "rgba(0, 255, 157, 0.1)",
              border: "1px solid #00ff9d",
            }}
          >
            [VERBUNDEN]
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("connect")}
          style={{
            ...buttonStyle,
            background: activeTab === "connect" ? "#00ff9d" : "#1a1a1a",
            color: activeTab === "connect" ? "#050505" : "#e0e0e0",
            borderColor: activeTab === "connect" ? "#00ff9d" : "#333",
          }}
        >
          Verbinden
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          style={{
            ...buttonStyle,
            background: activeTab === "saved" ? "#00ff9d" : "#1a1a1a",
            color: activeTab === "saved" ? "#050505" : "#e0e0e0",
            borderColor: activeTab === "saved" ? "#00ff9d" : "#333",
          }}
        >
          Gespeichert ({savedConnections.length})
        </button>
      </div>

      {activeTab === "connect" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label htmlFor="conn-name" style={labelStyle}>
                Verbindungsname
              </label>
              <input
                id="conn-name"
                type="text"
                value={config.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="z.B. Produktion DB"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="conn-type" style={labelStyle}>
                Datenbanktyp
              </label>
              <select
                id="conn-type"
                value={config.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as DatabaseConfig["type"])
                }
                style={inputStyle}
              >
                {databaseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="conn-host" style={labelStyle}>
                Host
              </label>
              <input
                id="conn-host"
                type="text"
                value={config.host}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="localhost"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="conn-port" style={labelStyle}>
                Port
              </label>
              <input
                id="conn-port"
                type="number"
                value={config.port}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    port: parseInt(e.target.value) || 0,
                  }))
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="conn-db" style={labelStyle}>
                Datenbank
              </label>
              <input
                id="conn-db"
                type="text"
                value={config.database}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, database: e.target.value }))
                }
                placeholder="Datenbankname"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="conn-user" style={labelStyle}>
                Benutzername
              </label>
              <input
                id="conn-user"
                type="text"
                value={config.username}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Username"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label htmlFor="conn-pass" style={labelStyle}>
                Passwort
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  id="conn-pass"
                  type={showPassword ? "text" : "password"}
                  value={config.password}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Passwort"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={buttonStyle}
                >
                  {showPassword ? "[VERSTECKEN]" : "[ZEIGEN]"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="conn-ssl"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                id="conn-ssl"
                type="checkbox"
                checked={config.ssl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, ssl: e.target.checked }))
                }
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#00ff9d",
                }}
              />
              <span style={{ color: "#e0e0e0", fontSize: "14px" }}>
                SSL/TLS Verschlüsselung verwenden
              </span>
            </label>
          </div>

          {status.lastError && (
            <div
              style={{
                padding: "15px",
                background: "rgba(255, 0, 0, 0.1)",
                border: "1px solid #ff0000",
                marginBottom: "20px",
                color: "#ff6666",
                fontSize: "14px",
              }}
            >
              [FEHLER] {status.lastError}
            </div>
          )}

          {status.connected && status.lastConnected && (
            <div
              style={{
                padding: "15px",
                background: "rgba(0, 255, 157, 0.1)",
                border: "1px solid #00ff9d",
                marginBottom: "20px",
                color: "#00ff9d",
                fontSize: "14px",
              }}
            >
              [ERFOLG] Verbunden seit{" "}
              {status.lastConnected.toLocaleTimeString()}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting || !config.host || !config.database}
              style={{
                ...buttonStyle,
                background: isConnecting ? "#0f0f0f" : "#00ff9d",
                color: isConnecting ? "#666" : "#050505",
                borderColor: "#00ff9d",
                cursor: isConnecting ? "not-allowed" : "pointer",
              }}
            >
              {isConnecting ? "[VERBINDE...]" : "[VERBINDEN]"}
            </button>

            {onTestConnection && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                style={{
                  ...buttonStyle,
                  opacity: isTesting ? 0.5 : 1,
                }}
              >
                {isTesting ? "[TESTE...]" : "[TESTEN]"}
              </button>
            )}

            {onSaveConnection && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!config.name}
                style={buttonStyle}
              >
                {editingId ? "[AKTUALISIEREN]" : "[SPEICHERN]"}
              </button>
            )}

            <button type="button" onClick={clearForm} style={buttonStyle}>
              [ZURÜCKSETZEN]
            </button>

            {status.connected && onDisconnect && (
              <button
                type="button"
                onClick={onDisconnect}
                style={{
                  ...buttonStyle,
                  background: "#ff0000",
                  borderColor: "#ff0000",
                  color: "#fff",
                }}
              >
                [TRENNEN]
              </button>
            )}
          </div>
        </>
      ) : (
        <div>
          {savedConnections.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Keine gespeicherten Verbindungen
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {savedConnections.map((conn) => (
                <div
                  key={conn.id}
                  style={{
                    padding: "15px",
                    background: "#0f0f0f",
                    border: "1px solid #1a1a1a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#00ff9d",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      {conn.name}
                    </div>
                    <div style={{ color: "#666", fontSize: "12px" }}>
                      {conn.type.toUpperCase()} • {conn.host}:{conn.port} •{" "}
                      {conn.database}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => loadConnection(conn)}
                      style={{
                        ...buttonStyle,
                        padding: "6px 12px",
                        fontSize: "12px",
                      }}
                    >
                      [LADEN]
                    </button>

                    {onDeleteConnection && conn.id && (
                      <button
                        type="button"
                        onClick={() => onDeleteConnection(conn.id!)}
                        style={{
                          ...buttonStyle,
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: "#ff0000",
                          borderColor: "#ff0000",
                          color: "#fff",
                        }}
                      >
                        [LÖSCHEN]
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseBlock;

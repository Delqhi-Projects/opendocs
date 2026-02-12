import React, { useState } from "react";

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    padding: "16px",
    borderRadius: 0,
    border: "1px solid #333",
    fontFamily: "monospace",
    height: "400px",
    display: "flex",
    flexDirection: "column" as const,
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
  chatArea: {
    flex: 1,
    backgroundColor: "#000000",
    border: "1px solid #333",
    padding: "12px",
    overflowY: "auto" as const,
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  message: {
    padding: "8px 12px",
    borderRadius: 0,
    maxWidth: "80%",
    fontSize: "0.85rem",
    lineHeight: "1.4",
  },
  userMessage: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    alignSelf: "flex-end",
    border: "1px solid #00ff9d",
  },
  botMessage: {
    backgroundColor: "#111",
    color: "#e0e0e0",
    alignSelf: "flex-start",
    border: "1px solid #333",
  },
  inputArea: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    border: "1px solid #333",
    padding: "8px",
    fontSize: "0.9rem",
    borderRadius: 0,
    outline: "none",
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    border: "1px solid #00ff9d",
    padding: "8px 16px",
    fontSize: "0.8rem",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    fontWeight: "bold",
  },
};

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "System initialized. How can I assist?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages([...messages, newMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Processing request...",
          sender: "bot",
        },
      ]);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[SYSTEM CHAT]</span>
        <div style={styles.label}>ONLINE</div>
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.sender === "user"
                ? styles.userMessage
                : styles.botMessage),
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="TYPE COMMAND..."
        />
        <button style={styles.button} onClick={sendMessage}>
          SEND
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

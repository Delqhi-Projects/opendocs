import React, { useState } from "react";

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    padding: "16px",
    borderRadius: 0,
    borderLeft: "1px solid #333",
    fontFamily: "monospace",
    height: "100%",
    width: "300px",
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
    maxWidth: "90%",
    fontSize: "0.8rem",
    lineHeight: "1.4",
  },
  userMessage: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    alignSelf: "flex-end",
    border: "1px solid #00ff9d",
  },
  aiMessage: {
    backgroundColor: "#111",
    color: "#e0e0e0",
    alignSelf: "flex-start",
    border: "1px solid #333",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    border: "1px solid #333",
    padding: "8px",
    fontSize: "0.85rem",
    borderRadius: 0,
    outline: "none",
    minHeight: "60px",
    resize: "none" as const,
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    border: "1px solid #00ff9d",
    padding: "8px 16px",
    fontSize: "0.75rem",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    fontWeight: "bold",
    width: "100%",
  },
};

export const RightSidebarAIChat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "AI Assistant ready. Ask me anything about your workflow.",
      sender: "ai",
    },
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
          text: "Analyzing context...",
          sender: "ai",
        },
      ]);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[AI ASSISTANT]</span>
        <div style={styles.label}>V2.0</div>
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.sender === "user"
                ? styles.userMessage
                : styles.aiMessage),
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="ASK AI..."
        />
        <button style={styles.button} onClick={sendMessage}>
          EXECUTE
        </button>
      </div>
    </div>
  );
};

export default RightSidebarAIChat;

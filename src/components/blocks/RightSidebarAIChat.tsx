import React, { useState, useRef, useEffect } from "react";

export interface AIMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  context?: string;
}

export interface RightSidebarAIChatProps {
  context?: string;
  onAskAI?: (question: string, context?: string) => Promise<string>;
}

const mockMessages: AIMessage[] = [
  {
    id: "1",
    text: "AI Assistant ready. Context loaded.",
    sender: "ai",
    timestamp: "10:00:00",
  },
];

export const RightSidebarAIChat: React.FC<RightSidebarAIChatProps> = ({
  context = "No active context selected.",
  onAskAI,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>(mockMessages);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      context: context,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      if (onAskAI) {
        const response = await onAskAI(userMsg.text, context);
        const aiMsg: AIMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setTimeout(() => {
          const aiMsg: AIMessage = {
            id: (Date.now() + 1).toString(),
            text: `I analyzed the context: "${context.substring(0, 20)}...". Here is my answer to "${userMsg.text}".`,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsThinking(false);
        }, 1500);
      }
    } catch (error) {
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: "Error analyzing request.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsThinking(false);
    }
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        borderLeft: "1px solid #1a1a1a",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        width: "300px",
      }}
    >
      <div
        style={{
          padding: "15px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#00ff9d",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          [AI ASSISTANT]
        </h3>
        <div
          style={{
            width: "8px",
            height: "8px",
            background: isThinking ? "#00ff9d" : "#333",
            borderRadius: "50%",
            animation: isThinking ? "pulse 1s infinite" : "none",
          }}
        />
      </div>

      <div
        style={{
          padding: "10px",
          background: "#0f0f0f",
          borderBottom: "1px solid #1a1a1a",
          fontSize: "11px",
          color: "#666",
        }}
      >
        <div style={{ marginBottom: "4px", textTransform: "uppercase" }}>
          ACTIVE CONTEXT:
        </div>
        <div
          style={{
            color: "#e0e0e0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={context}
        >
          {context}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#666",
                marginBottom: "4px",
                textAlign: msg.sender === "user" ? "right" : "left",
                textTransform: "uppercase",
              }}
            >
              [{msg.sender}] {msg.timestamp}
            </div>
            <div
              style={{
                background: msg.sender === "user" ? "#1a1a1a" : "#0f0f0f",
                border: `1px solid ${
                  msg.sender === "user" ? "#00ff9d" : "#333"
                }`,
                color: msg.sender === "user" ? "#fff" : "#e0e0e0",
                padding: "10px",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: "15px", borderTop: "1px solid #1a1a1a" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="ASK AI..."
          style={{
            width: "100%",
            height: "80px",
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            color: "#fff",
            padding: "10px",
            fontSize: "12px",
            outline: "none",
            resize: "none",
            marginBottom: "10px",
            borderRadius: 0,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          style={{
            width: "100%",
            padding: "8px",
            background: !input.trim() || isThinking ? "#1a1a1a" : "#00ff9d",
            border: "1px solid",
            borderColor: !input.trim() || isThinking ? "#333" : "#00ff9d",
            color: !input.trim() || isThinking ? "#666" : "#050505",
            cursor: !input.trim() || isThinking ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderRadius: 0,
          }}
        >
          {isThinking ? "[THINKING...]" : "[EXECUTE]"}
        </button>
      </div>
    </div>
  );
};

export default RightSidebarAIChat;

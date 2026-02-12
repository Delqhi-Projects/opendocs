import React, { useState, useRef, useEffect } from "react";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: string;
}

export interface ChatPanelProps {
  initialMessages?: Message[];
  onSendMessage?: (text: string) => Promise<string>;
}

const mockMessages: Message[] = [
  {
    id: "1",
    text: "System initialized. Secure channel established.",
    sender: "system",
    timestamp: "10:00:00",
  },
  {
    id: "2",
    text: "How can I assist you today?",
    sender: "bot",
    timestamp: "10:00:05",
  },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  initialMessages = mockMessages,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(userMsg.text);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setTimeout(() => {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: `Command received: "${userMsg.text}". Processing...`,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
        }, 1000);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error processing command.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
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
        height: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
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
          [SECURE CHAT]
        </h3>
        <div
          style={{
            color: isTyping ? "#00ff9d" : "#666",
            fontSize: "12px",
            textTransform: "uppercase",
            animation: isTyping ? "pulse 1s infinite" : "none",
          }}
        >
          {isTyping ? "TYPING..." : "ONLINE"}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "15px",
          paddingRight: "5px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf:
                msg.sender === "user"
                  ? "flex-end"
                  : msg.sender === "system"
                    ? "center"
                    : "flex-start",
              maxWidth: msg.sender === "system" ? "100%" : "80%",
              width: msg.sender === "system" ? "100%" : "auto",
              textAlign: msg.sender === "system" ? "center" : "left",
            }}
          >
            {msg.sender !== "system" && (
              <div
                style={{
                  fontSize: "10px",
                  color: "#666",
                  marginBottom: "2px",
                  textAlign: msg.sender === "user" ? "right" : "left",
                  textTransform: "uppercase",
                }}
              >
                [{msg.sender}] {msg.timestamp}
              </div>
            )}
            <div
              style={{
                background:
                  msg.sender === "user"
                    ? "rgba(0, 255, 157, 0.1)"
                    : msg.sender === "system"
                      ? "transparent"
                      : "#1a1a1a",
                border:
                  msg.sender === "user"
                    ? "1px solid #00ff9d"
                    : msg.sender === "system"
                      ? "none"
                      : "1px solid #333",
                color:
                  msg.sender === "user"
                    ? "#fff"
                    : msg.sender === "system"
                      ? "#666"
                      : "#e0e0e0",
                padding: msg.sender === "system" ? "5px" : "10px 15px",
                fontSize: msg.sender === "system" ? "11px" : "13px",
                lineHeight: "1.5",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="ENTER MESSAGE..."
          style={{
            flex: 1,
            padding: "12px",
            background: "#0f0f0f",
            border: "1px solid #1a1a1a",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
            borderRadius: 0,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: "0 20px",
            background: input.trim() ? "#00ff9d" : "#1a1a1a",
            border: "1px solid",
            borderColor: input.trim() ? "#00ff9d" : "#333",
            color: input.trim() ? "#050505" : "#666",
            cursor: input.trim() ? "pointer" : "not-allowed",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderRadius: 0,
          }}
        >
          [SEND]
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

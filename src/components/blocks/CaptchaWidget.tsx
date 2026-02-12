import React, { useState } from "react";

const styles = {
  container: {
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    padding: "16px",
    borderRadius: 0,
    border: "1px solid #333",
    fontFamily: "monospace",
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
  captchaArea: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    height: "100px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px",
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#00ff9d",
    letterSpacing: "4px",
    userSelect: "none" as const,
  },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    border: "1px solid #333",
    padding: "8px",
    fontSize: "1rem",
    marginBottom: "16px",
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
    width: "100%",
  },
};

export const CaptchaWidget: React.FC = () => {
  const [captcha, setCaptcha] = useState("X7K9P");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");

  const verify = () => {
    if (input.toUpperCase() === captcha) {
      setStatus("VERIFIED");
    } else {
      setStatus("FAILED");
    }
  };

  const refresh = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setInput("");
    setStatus("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[CAPTCHA VERIFICATION]</span>
        <div style={styles.label}>{status || "PENDING"}</div>
      </div>

      <div style={styles.captchaArea} onClick={refresh}>
        {captcha}
      </div>

      <input
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ENTER CODE"
      />

      <button style={styles.button} onClick={verify}>
        VERIFY
      </button>
    </div>
  );
};

export default CaptchaWidget;

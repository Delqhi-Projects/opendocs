import React, { useState, useRef } from "react";

export interface CaptchaWidgetProps {
  onSolve?: (file: File) => Promise<string>;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({ onSolve }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "solving" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus("idle");
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus("idle");
      setResult(null);
    }
  };

  const handleSolve = async () => {
    if (!file) return;

    setStatus("solving");
    try {
      if (onSolve) {
        const solution = await onSolve(file);
        setResult(solution);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setResult("X7K9P");
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          [CAPTCHA SOLVER]
        </h3>
        <div
          style={{
            color:
              status === "success"
                ? "#00ff9d"
                : status === "error"
                  ? "#ff0000"
                  : status === "solving"
                    ? "#e0e0e0"
                    : "#666",
            fontSize: "12px",
            textTransform: "uppercase",
          }}
        >
          STATUS: {status.toUpperCase()}
        </div>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed #333",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "20px",
            color: "#666",
            fontSize: "14px",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00ff9d")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div>[DROP IMAGE HERE]</div>
          <div style={{ fontSize: "12px", marginTop: "10px" }}>
            OR CLICK TO UPLOAD
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "200px",
              background: "#000",
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={preview}
              alt="Captcha"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            {status === "solving" && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00ff9d",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                [PROCESSING...]
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            <span>{file?.name}</span>
            <button
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "none",
                color: "#ff0000",
                cursor: "pointer",
                fontSize: "12px",
                textTransform: "uppercase",
                padding: 0,
              }}
            >
              [REMOVE]
            </button>
          </div>
        </div>
      )}

      {result && (
        <div
          style={{
            background: "rgba(0, 255, 157, 0.1)",
            border: "1px solid #00ff9d",
            padding: "15px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#00ff9d",
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "5px",
            }}
          >
            SOLUTION FOUND
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: "24px",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            {result}
          </div>
        </div>
      )}

      <button
        onClick={handleSolve}
        disabled={!file || status === "solving"}
        style={{
          width: "100%",
          padding: "12px",
          background: !file || status === "solving" ? "#1a1a1a" : "#00ff9d",
          border: "1px solid",
          borderColor: !file || status === "solving" ? "#333" : "#00ff9d",
          color: !file || status === "solving" ? "#666" : "#050505",
          cursor: !file || status === "solving" ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "1px",
          borderRadius: 0,
          transition: "all 0.2s",
        }}
      >
        {status === "solving" ? "[SOLVING...]" : "[SOLVE CAPTCHA]"}
      </button>
    </div>
  );
};

export default CaptchaWidget;

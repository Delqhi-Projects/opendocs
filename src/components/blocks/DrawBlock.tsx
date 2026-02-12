import React, { useRef, useState, useEffect } from "react";

export interface DrawBlockProps {
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
}

type Tool = "pen" | "eraser" | "rect" | "circle";

export const DrawBlock: React.FC<DrawBlockProps> = ({
  width = 800,
  height = 400,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#00ff9d");
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        setContext(ctx);
      }
    }
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === "eraser" ? "#000000" : color;
      context.lineWidth = tool === "eraser" ? lineWidth * 5 : lineWidth;
    }
  }, [context, tool, color, lineWidth]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;
    const { x, y } = getMousePos(e);
    setStartPos({ x, y });
    setIsDrawing(true);

    if (tool === "pen" || tool === "eraser") {
      context.beginPath();
      context.moveTo(x, y);
    } else {
      setSnapshot(
        context.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        ),
      );
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current || !startPos) return;
    const { x, y } = getMousePos(e);

    if (tool === "pen" || tool === "eraser") {
      context.lineTo(x, y);
      context.stroke();
    } else if (snapshot) {
      context.putImageData(snapshot, 0, 0);
      context.beginPath();

      if (tool === "rect") {
        context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2),
        );
        context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      }

      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setIsDrawing(false);
      setStartPos(null);
      setSnapshot(null);
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `drawing-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      onSave?.(dataUrl);
    }
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: "6px 12px",
    background: isActive ? "#00ff9d" : "#1a1a1a",
    border: "1px solid",
    borderColor: isActive ? "#00ff9d" : "#333",
    color: isActive ? "#050505" : "#e0e0e0",
    cursor: "pointer",
    borderRadius: 0,
    fontSize: "12px",
    textTransform: "uppercase" as const,
    fontWeight: "bold" as const,
    minWidth: "80px",
  });

  const colorButtonStyle = (c: string) => ({
    width: "24px",
    height: "24px",
    background: c,
    border: color === c ? "2px solid #fff" : "1px solid #333",
    cursor: "pointer",
    borderRadius: 0,
  });

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
          [DRAWING CANVAS]
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={buttonStyle(false)} onClick={clearCanvas}>
            [CLEAR]
          </button>
          <button style={buttonStyle(false)} onClick={handleExport}>
            [EXPORT]
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            style={buttonStyle(tool === "pen")}
            onClick={() => setTool("pen")}
          >
            [PEN]
          </button>
          <button
            style={buttonStyle(tool === "eraser")}
            onClick={() => setTool("eraser")}
          >
            [ERASER]
          </button>
          <button
            style={buttonStyle(tool === "rect")}
            onClick={() => setTool("rect")}
          >
            [RECT]
          </button>
          <button
            style={buttonStyle(tool === "circle")}
            onClick={() => setTool("circle")}
          >
            [CIRCLE]
          </button>
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              textTransform: "uppercase",
              marginRight: "5px",
            }}
          >
            COLOR:
          </div>
          {[
            "#00ff9d",
            "#ffffff",
            "#ff0000",
            "#0088ff",
            "#ff00ff",
            "#ffff00",
          ].map((c) => (
            <button
              key={c}
              style={colorButtonStyle(c)}
              onClick={() => setColor(c)}
              title={c}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              textTransform: "uppercase",
              marginRight: "5px",
            }}
          >
            SIZE:
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{
              width: "100px",
              accentColor: "#00ff9d",
            }}
          />
        </div>
      </div>

      <div
        style={{
          border: "1px solid #333",
          background: "#000",
          cursor: tool === "eraser" ? "cell" : "crosshair",
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default DrawBlock;

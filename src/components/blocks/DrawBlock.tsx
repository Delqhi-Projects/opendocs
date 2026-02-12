import React, { useRef, useState, useEffect } from "react";

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
  canvas: {
    backgroundColor: "#000000",
    border: "1px solid #333",
    cursor: "crosshair",
    width: "100%",
    height: "300px",
  },
  controls: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  button: {
    backgroundColor: "#1a1a1a",
    color: "#00ff9d",
    border: "1px solid #00ff9d",
    padding: "6px 12px",
    fontSize: "0.75rem",
    cursor: "pointer",
    textTransform: "uppercase" as const,
    borderRadius: 0,
    fontWeight: "bold",
  },
};

export const DrawBlock: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#00ff9d";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (context) {
      context.beginPath();
      context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>[DRAWING CANVAS]</span>
        <div style={styles.label}>TOOL: PEN</div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={styles.canvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      <div style={styles.controls}>
        <button style={styles.button} onClick={clearCanvas}>
          CLEAR
        </button>
        <button style={styles.button}>SAVE</button>
      </div>
    </div>
  );
};

export default DrawBlock;

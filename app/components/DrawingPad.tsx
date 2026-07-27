"use client";

import { useEffect, useRef, useState } from "react";

const PAPER = "#fffdf8";
const INK = "#1e1c18";
const W = 600;
const H = 380;

type Tool = "pen" | "eraser";

export default function DrawingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [tool, setTool] = useState<Tool>("pen");

  // 초기 배경
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function toCanvas(e: React.PointerEvent): { x: number; y: number } {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  function pushHistory() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, W, H));
    if (history.current.length > 25) history.current.shift();
  }

  function onDown(e: React.PointerEvent) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    pushHistory();
    drawing.current = true;
    last.current = toCanvas(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = toCanvas(e);
    ctx.strokeStyle = tool === "pen" ? INK : PAPER;
    ctx.lineWidth = tool === "pen" ? 4 : 22;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function onUp() {
    drawing.current = false;
    last.current = null;
  }

  function undo() {
    const ctx = canvasRef.current?.getContext("2d");
    const prev = history.current.pop();
    if (ctx && prev) ctx.putImageData(prev, 0, 0);
  }

  function clear() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    pushHistory();
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
  }

  const toolBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    fontSize: 13,
    borderRadius: "var(--border-radius-md)",
    background: active ? "var(--color-background-secondary)" : "var(--color-background-primary)",
    borderColor: active ? "var(--color-border-secondary)" : "var(--color-border-tertiary)",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{
          width: "100%",
          aspectRatio: `${W} / ${H}`,
          borderRadius: "var(--border-radius-lg)",
          border: "1.5px solid var(--color-border-secondary)",
          background: PAPER,
          touchAction: "none",
          cursor: "crosshair",
          display: "block",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setTool("pen")} style={toolBtn(tool === "pen")}>
          <i className="ti ti-pencil" style={{ fontSize: 18 }} aria-hidden="true"></i> 펜
        </button>
        <button onClick={() => setTool("eraser")} style={toolBtn(tool === "eraser")}>
          <i className="ti ti-eraser" style={{ fontSize: 18 }} aria-hidden="true"></i> 지우개
        </button>
        <button onClick={undo} style={toolBtn(false)}>
          <i className="ti ti-arrow-back-up" style={{ fontSize: 18 }} aria-hidden="true"></i> 되돌리기
        </button>
        <button onClick={clear} style={toolBtn(false)}>
          <i className="ti ti-trash" style={{ fontSize: 18 }} aria-hidden="true"></i> 전체 지우기
        </button>
      </div>
    </div>
  );
}

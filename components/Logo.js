'use client';
import { useEffect, useRef } from 'react';

export default function Logo({ size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw anime character silhouette
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    // Head
    ctx.arc(size * 0.5, size * 0.3, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.45);
    ctx.lineTo(size * 0.3, size * 0.7);
    ctx.lineTo(size * 0.4, size * 0.85);
    ctx.lineTo(size * 0.5, size * 0.8);
    ctx.lineTo(size * 0.6, size * 0.85);
    ctx.lineTo(size * 0.7, size * 0.7);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.beginPath();
    ctx.moveTo(size * 0.35, size * 0.5);
    ctx.lineTo(size * 0.15, size * 0.6);
    ctx.lineTo(size * 0.2, size * 0.65);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(size * 0.65, size * 0.5);
    ctx.lineTo(size * 0.85, size * 0.6);
    ctx.lineTo(size * 0.8, size * 0.65);
    ctx.closePath();
    ctx.fill();

    // Draw sign/board
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(size * 0.25, size * 0.1, size * 0.5, size * 0.12);
    
    // Border for sign
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(size * 0.25, size * 0.1, size * 0.5, size * 0.12);

    // Text on sign
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${size * 0.06}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DannNime', size * 0.5, size * 0.16);

  }, [size]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

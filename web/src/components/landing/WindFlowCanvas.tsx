"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFieldQuery } from "@/lib/queries";

const INDIA_COORDINATES: [number, number][] = [
  [74.8, 37.1],
  [76.8, 36.2],
  [79.2, 35.5],
  [78.9, 32.8],
  [80.3, 31.0],
  [81.2, 30.1],
  [88.1, 27.9],
  [89.5, 27.3],
  [92.1, 27.8],
  [95.5, 28.5],
  [97.1, 28.1],
  [96.2, 26.5],
  [94.8, 25.2],
  [93.1, 24.1],
  [92.2, 23.9],
  [91.8, 25.2],
  [89.8, 25.8],
  [88.3, 22.5],
  [86.9, 21.6],
  [85.1, 19.8],
  [82.2, 17.0],
  [80.3, 13.1],
  [79.8, 10.8],
  [78.2, 9.2],
  [77.5, 8.1],
  [76.5, 9.5],
  [75.8, 11.5],
  [74.8, 13.5],
  [73.8, 15.5],
  [72.8, 19.1],
  [72.7, 21.2],
  [70.2, 21.0],
  [68.8, 22.3],
  [68.5, 23.8],
  [71.1, 24.5],
  [70.5, 27.2],
  [72.5, 29.8],
  [74.2, 32.2],
  [74.8, 37.1]
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  age: number;
  maxAge: number;
  size: number;
  hue: number;
}

export function WindFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [reducedMotion, setReducedMotion] = useState(false);
  const { data: fieldData } = useFieldQuery({ variable: "wind_speed", lead: 24, model: "samanvay" });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    const minLon = 68.0, maxLon = 98.0;
    const minLat = 6.0, maxLat = 38.0;

    const project = (lon: number, lat: number) => {
      const padX = width * 0.12;
      const padY = height * 0.08;
      const availW = width - padX * 2;
      const availH = height - padY * 2;
      const scale = Math.min(availW / (maxLon - minLon), availH / (maxLat - minLat));
      const cx = width / 2;
      const cy = height / 2;
      const lonCenter = (minLon + maxLon) / 2;
      const latCenter = (minLat + maxLat) / 2;

      const px = cx + (lon - lonCenter) * scale;
      const py = cy - (lat - latCenter) * scale;
      return { x: px, y: py };
    };

    const buildIndiaPath = () => {
      const path = new Path2D();
      INDIA_COORDINATES.forEach(([lon, lat], index) => {
        const { x, y } = project(lon, lat);
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      path.closePath();
      return path;
    };

    const indiaPath = buildIndiaPath();

    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(0, 245, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke(indiaPath);
      ctx.restore();

      ctx.save();
      ctx.clip(indiaPath);
      ctx.strokeStyle = "rgba(0, 245, 255, 0.25)";
      ctx.lineWidth = 1;
      for (let y = height * 0.2; y < height * 0.9; y += 22) {
        ctx.beginPath();
        for (let x = width * 0.2; x < width * 0.85; x += 15) {
          const wave = Math.sin(x * 0.015 + y * 0.02) * 12;
          if (x === width * 0.2) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      ctx.restore();
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const PARTICLE_COUNT = Math.min(2000, Math.floor((width * height) / 650));
    const particles: Particle[] = [];

    const spawnParticle = (p?: Particle): Particle => {
      const lon = minLon + Math.random() * (maxLon - minLon);
      const lat = minLat + Math.random() * (maxLat - minLat);
      const { x, y } = project(lon, lat);

      const u = 1.2 + Math.random() * 2.2;
      const v = -(0.8 + Math.random() * 1.8);
      const speed = Math.hypot(u, v);
      const hue = 175 + Math.random() * 45;

      return {
        x,
        y,
        vx: u,
        vy: v,
        speed,
        age: p ? 0 : Math.floor(Math.random() * 120),
        maxAge: 70 + Math.floor(Math.random() * 90),
        size: 1.0 + Math.random() * 1.6,
        hue
      };
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawnParticle());
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16.67;
      lastTime = time;

      ctx.fillStyle = "rgba(7, 11, 20, 0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = "rgba(0, 245, 255, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.shadowColor = "rgba(0, 245, 255, 0.4)";
      ctx.shadowBlur = 8;
      ctx.stroke(indiaPath);
      ctx.restore();

      ctx.save();
      ctx.clip(indiaPath);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age += dt;

        if (p.age >= p.maxAge) {
          particles[i] = spawnParticle(p);
          continue;
        }

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150 && dist > 1) {
            const force = (1 - dist / 150) * 1.8;
            p.vx += (-dy / dist) * force;
            p.vy += (dx / dist) * force;
          }
        }

        p.vx = p.vx * 0.96 + 0.08;
        p.vy = p.vy * 0.96 - 0.05;

        const prevX = p.x;
        const prevY = p.y;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const lifeRatio = p.age / p.maxAge;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.85;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${p.hue}, 95%, 65%, ${alpha})`;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        style={{ touchAction: "none" }}
        aria-label="Monsoonal wind flow field particle simulation masked over India"
        role="img"
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-surface-0/40 to-surface-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-surface-0 to-transparent pointer-events-none" />
    </div>
  );
}

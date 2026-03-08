"use client";

import { useRef, useId } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion";

interface InfiniteGridProps {
  className?: string;
  /** Opacity of the always-visible base grid (0–1) */
  baseOpacity?: number;
  /** Opacity of the mouse-reveal grid layer (0–1) */
  revealOpacity?: number;
  /** Radius of the mouse reveal circle in px */
  revealRadius?: number;
  /** Grid cell size in px */
  cellSize?: number;
  /** Scroll speed (px per frame) */
  speedX?: number;
  speedY?: number;
  children?: React.ReactNode;
}

export default function InfiniteGrid({
  className,
  baseOpacity = 0.05,
  revealOpacity = 0.4,
  revealRadius = 300,
  cellSize = 40,
  speedX = 0.5,
  speedY = 0.5,
  children,
}: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % cellSize);
    gridOffsetY.set((gridOffsetY.get() + speedY) % cellSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(${revealRadius}px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Base grid — always visible */}
      <div className="absolute inset-0 z-0" style={{ opacity: baseOpacity }}>
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} cellSize={cellSize} suffix="base" />
      </div>

      {/* Reveal grid — follows mouse */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ opacity: revealOpacity, maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} cellSize={cellSize} suffix="reveal" />
      </motion.div>

      {/* Bottom fade — soft transition to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-[1] pointer-events-none bg-gradient-to-t from-bg to-transparent" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-orange-500/40 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-accent/30 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-accent/30 blur-[120px]" />
      </div>

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

function GridPattern({
  offsetX,
  offsetY,
  cellSize,
  suffix,
}: {
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  cellSize: number;
  suffix: string;
}) {
  const id = useId();
  const patternId = `grid-${suffix}-${id}`;

  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={patternId}
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-text-dim"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

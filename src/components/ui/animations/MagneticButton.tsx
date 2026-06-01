"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import type { ReactNode } from "react";

/* ============================================================
   MagneticButton — button that pulls toward cursor with spring.

   onMouseMove: calculates distance from center, lerps toward cursor.
   useSpring: damping 15, stiffness 150.
   Wraps any children — usually used for CTA buttons.
   ============================================================ */

export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { damping: 15, stiffness: 150 });
  const y = useSpring(0, { damping: 15, stiffness: 150 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    x.set(dx);
    y.set(dy);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const Tag = href ? motion.a : motion.button;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      style={{ x, y, display: "inline-block" }}
    >
      <Tag
        className={className}
        onClick={onClick}
        href={href}
        animate={{
          scale: isHovered ? 1.06 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

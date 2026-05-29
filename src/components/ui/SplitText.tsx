"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

/* ---------------------------------------------------------------------------
   Split Text Reveal
   Splits text into words and wraps each in an overflow-hidden mask. When
   scrolled into view, the words slide up gracefully. This is a signature
   typography animation of luxury fashion editorial sites.
--------------------------------------------------------------------------- */

export function SplitText({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const container = useRef(null);
  
  // Split the string into words. 
  // For actual production we'd use a more robust line-splitting algorithm or library (like SplitType)
  // but word-splitting is standard and looks great for short-to-medium luxury headings.
  const words = children.split(" ");

  return (
    <motion.div
      ref={container}
      className={`flex flex-wrap ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: {
          transition: { staggerChildren: 0.04, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) => (
        <span key={i} className="relative overflow-hidden inline-flex mr-[0.25em]">
          <motion.span
            variants={{
              hidden: { y: "110%", rotateZ: 3 },
              visible: { 
                y: "0%", 
                rotateZ: 0,
                transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
              },
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

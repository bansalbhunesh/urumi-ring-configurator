"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BlurReveal } from "@/components/ui/animations/BlurReveal";

/* ============================================================
   WaterDiamond — GLSL water distortion shader section.

   A WebGL canvas fills the section. A ripple distortion
   effect, driven by scroll progress, makes the diamond / ring
   appear to emerge from beneath shimmering water.

   The shader is a classic caustic/ripple interference pattern.
   On reduced-motion or canvas-fail, a static gradient renders.
   ============================================================ */

const VERT = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uRes;

  #define TAU 6.28318530718

  float wave(vec2 p, float freq, float speed, float phase) {
    float d = length(p);
    return sin(d * freq - uTime * speed + phase);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

    // Concentric interference rings
    float w1 = wave(uv,           18.0, 2.4, 0.0);
    float w2 = wave(uv - vec2(0.18, 0.0), 14.0, 1.8, 1.2);
    float w3 = wave(uv + vec2(0.0, 0.14), 22.0, 3.1, 2.6);
    float ripple = (w1 + w2 + w3) / 3.0;

    // Refract uv
    float strength = 0.024 * (1.0 - uProgress * 0.7);
    vec2 refracted = uv + vec2(ripple) * strength;

    // Background gradient: deep navy → sapphire
    vec3 deep  = vec3(0.03, 0.05, 0.12);
    vec3 mid   = vec3(0.06, 0.11, 0.28);
    vec3 light = vec3(0.48, 0.72, 1.00);

    float r = length(refracted);
    vec3 bg = mix(deep, mid, smoothstep(0.0, 0.5, r));
    bg = mix(bg, light, smoothstep(0.3, 0.8, r) * 0.4);

    // Caustic highlight network
    float caustic = pow(max(0.0, ripple), 3.0) * 0.5;
    bg += vec3(0.6, 0.8, 1.0) * caustic * (1.0 - uProgress * 0.8);

    // Gold emergence: diamond pushing through water
    float emerge = smoothstep(0.0, 0.6, uProgress);
    vec3 gold    = vec3(0.88, 0.75, 0.38);
    float spot   = smoothstep(0.18, 0.0, length(uv)) * emerge;
    bg = mix(bg, gold, spot * 0.85);

    // Vignette
    float vig = 1.0 - smoothstep(0.3, 0.9, length(uv * vec2(0.9, 1.1)));
    bg *= vig;

    gl_FragColor = vec4(bg, 1.0);
  }
`;

function useWebGLCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  progress: { get: () => number },
  reduceMotion: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime     = gl.getUniformLocation(prog, "uTime");
    const uProgress = gl.getUniformLocation(prog, "uProgress");
    const uRes      = gl.getUniformLocation(prog, "uRes");

    let raf: number;
    const render = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(uTime, now / 1000);
      gl.uniform1f(uProgress, progress.get());
      gl.uniform2f(uRes, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, progress, reduceMotion]);
}

export function WaterDiamond() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const emerge = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  useWebGLCanvas(canvasRef, emerge, reduceMotion);

  const textY = useTransform(scrollYProgress, [0.2, 0.8], [40, -40]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.45, 0.75, 0.95], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      data-ring="hidden"
      className="relative min-h-[140svh] overflow-hidden"
      aria-label="Water diamond reveal"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {reduceMotion ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#030812] via-[#0f1c42] to-[#030812]" />
        ) : (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ width: "100%", height: "100%" }}
          />
        )}

        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <BlurReveal delay={0.1}>
            <span className="eyebrow text-sky-200/80">Pure carbon · 2F deep</span>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <h2 className="font-display text-balance text-[2rem] leading-snug text-white sm:text-[3rem]">
              Born under pressure.
              <br />
              <span className="text-sky-300">Refracting eternity.</span>
            </h2>
          </BlurReveal>
          <BlurReveal delay={0.35}>
            <p className="max-w-md text-[1rem] leading-relaxed text-sky-100/70">
              Every diamond we set carries billions of years inside it. The Twist
              honours that by giving it the perfect stage to scatter light.
            </p>
          </BlurReveal>
        </motion.div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulseStep: number;
}

export const HeroParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Color palette: glowing orange, warm amber, champagne ember, subtle white
    const colors = [
      "255, 64, 1",    // Brand primary orange
      "255, 120, 20",  // Vivid light orange
      "245, 158, 11",  // Warm amber
      "255, 180, 70",  // Champagne gold
      "255, 255, 255", // Soft highlight
    ];

    // Create 32 subtle particles
    const particleCount = Math.min(36, Math.floor((width * height) / 28000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = 0.08 + Math.random() * 0.24;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 2.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.18 + Math.random() * 0.35), // Drifts gently upwards
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseStep: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.pulseStep += p.pulseSpeed;

        // Subtle opacity pulsing
        p.alpha = p.baseAlpha + Math.sin(p.pulseStep) * 0.08;
        if (p.alpha < 0.02) p.alpha = 0.02;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle with soft radial glow
        const glowRadius = p.radius * 2.5;
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          glowRadius
        );
        gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.alpha * 1.5)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[2] w-full h-full pointer-events-none select-none opacity-80"
    />
  );
};

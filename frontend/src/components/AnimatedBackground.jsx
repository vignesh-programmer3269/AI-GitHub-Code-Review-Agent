import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Particles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate static initial positions to avoid hydration mismatch if doing SSR,
    // but here we just generate them once on mount.
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-bg-canvas overflow-hidden">
      {/* GitHub-style grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle radial gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Soft indigo glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />

      {/* Floating blurred blobs using Framer Motion */}
      <motion.div
        className="absolute top-[20%] left-[60%] w-96 h-96 rounded-full bg-accent/5 blur-[100px] pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[60%] left-[20%] w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <Particles />

      {/* Very subtle network lines pattern (using a subtle repeating linear gradient crosshatch or just a mask over the grid) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-canvas/50 to-bg-canvas pointer-events-none" />
    </div>
  );
}

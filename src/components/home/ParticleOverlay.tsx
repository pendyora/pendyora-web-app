'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
}

export default function ParticleOverlay() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 110}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        duration: 6 + Math.random() * 8,
        delay: -(Math.random() * 10),
        color: Math.random() > 0.5 ? '#00f5c4' : '#3d00b8',
        opacity: 0.3 + Math.random() * 0.4,
      })),
    );
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes pendyora-drift {
          from { transform: translateY(0); }
          to   { transform: translateY(-120vh); }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            opacity: p.opacity,
            animation: `pendyora-drift ${p.duration}s ${p.delay}s linear infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}

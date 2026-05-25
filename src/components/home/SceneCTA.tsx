'use client';

import { useState } from 'react';

import { MotionValue, motion, useMotionValueEvent, useTransform } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function SceneCTA({ scrollYProgress }: Props) {
  const [entered, setEntered] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);

  // Scene fades in from 83% onward
  const sceneOpacity = useTransform(scrollYProgress, [0.83, 0.87], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v >= 0.85) {
      setEntered(true);
    }
  });

  return (
    <motion.div style={{ opacity: sceneOpacity, position: 'absolute', inset: 0 }}>
      {/* Looping ambient particles video */}
      <video
        src="/pendyora/vid-04-particles.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Fallback */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #050a08 0%, #0a1420 100%)',
          zIndex: -1,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(5,10,8,0.88) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content — centred column */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          pointerEvents: 'none',
        }}
      >
        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={entered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0 }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
            fontWeight: 300,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#e8f4f0',
          }}
        >
          Pendyora
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1rem, 2vw, 1.6rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.08em',
            color: '#e8f4f0',
            opacity: 0.85,
          }}
        >
          Simply rare.&ensp;Simply you.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          style={{ pointerEvents: 'auto', position: 'relative' }}
        >
          {/* Pulse ring */}
          {hoverBtn && (
            <motion.span
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                border: '1px solid #00f5c4',
                pointerEvents: 'none',
              }}
            />
          )}

          <button
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              padding: 'clamp(0.6rem, 1.2vw, 0.9rem) clamp(2rem, 3.5vw, 3rem)',
              border: `1px solid ${hoverBtn ? '#00f5c4' : '#c9a84c'}`,
              background: 'transparent',
              color: hoverBtn ? '#00f5c4' : '#e8f4f0',
              fontFamily: 'Libre Franklin, sans-serif',
              fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'color 0.25s ease, border-color 0.25s ease',
            }}
          >
            Explore Collection
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

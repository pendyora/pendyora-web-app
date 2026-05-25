'use client';

import { useEffect, useState } from 'react';

import { type Variants, MotionValue, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';

import ParticleOverlay from './ParticleOverlay';
import VideoScrubber from './VideoScrubber';

interface Props {
  scrollYProgress: MotionValue<number>;
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function SceneDragon({ scrollYProgress }: Props) {
  const [showText, setShowText] = useState(false);

  // Mouse centred at 0 — avoids window.innerWidth reference during render
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const sceneOpacity = useTransform(scrollYProgress, [0.18, 0.22, 0.43, 0.47], [0, 1, 1, 0]);

  // Range-based parallax: ±8px over ±960px from centre (safe for any viewport)
  const videoX = useTransform(mouseX, [-960, 0, 960], [-8, 0, 8]);
  const videoY = useTransform(mouseY, [-540, 0, 540], [-8, 0, 8]);

  // Teal spotlight follows raw cursor position
  const spotlight = useTransform([mouseX, mouseY] as MotionValue[], ([mx, my]) => {
    const cx = (mx as number) + window.innerWidth / 2;
    const cy = (my as number) + window.innerHeight / 2;
    return `radial-gradient(350px circle at ${cx}px ${cy}px, rgba(0,245,196,0.18) 0%, transparent 65%)`;
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShowText(v > 0.28 && v < 0.45);
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Store centred values — avoids window reference in useTransform
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div style={{ opacity: sceneOpacity, position: 'absolute', inset: 0 }}>
      {/* Fallback — first in DOM = lowest layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, #050a08 0%, #2d1b69 60%, #050a08 100%)',
        }}
      />

      {/* Scrubbed video with mouse parallax */}
      <motion.div style={{ x: videoX, y: videoY, position: 'absolute', inset: '-16px' }}>
        <VideoScrubber src="/pendyora/vid-03-dragon.mp4" scrollYProgress={scrollYProgress} scrollStart={0.2} scrollEnd={0.45} style={{ inset: 0 }} />
      </motion.div>

      {/* Edge vignette — centre lit */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 70% at center, transparent 20%, rgba(5,10,8,0.9) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Mouse spotlight */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: spotlight,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      <ParticleOverlay />

      {/* "She chose the rare." */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <motion.p
          variants={textVariants}
          initial="hidden"
          animate={showText ? 'visible' : 'hidden'}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: '#e8f4f0',
          }}
        >
          She chose the rare.
        </motion.p>
      </div>
    </motion.div>
  );
}

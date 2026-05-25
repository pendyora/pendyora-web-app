'use client';

import { useState } from 'react';

import { type Variants, MotionValue, motion, useMotionValueEvent, useTransform } from 'framer-motion';

import ParticleOverlay from './ParticleOverlay';
import VideoScrubber from './VideoScrubber';

interface Props {
  scrollYProgress: MotionValue<number>;
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function SceneJewelry({ scrollYProgress }: Props) {
  const [showText, setShowText] = useState(false);

  const sceneOpacity = useTransform(scrollYProgress, [0.63, 0.67, 0.83, 0.87], [0, 1, 1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShowText(v > 0.72 && v < 0.85);
  });

  return (
    <motion.div style={{ opacity: sceneOpacity, position: 'absolute', inset: 0 }}>
      {/* Fallback — first = lowest layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #050a08 0%, #111 100%)',
        }}
      />

      {/* Scrubbed video */}
      <VideoScrubber src="/pendyora/vid-05-jewelry.mp4" scrollYProgress={scrollYProgress} scrollStart={0.65} scrollEnd={0.85} />

      <ParticleOverlay />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5,10,8,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* "Crafted for the rare few." */}
      <motion.p
        variants={textVariants}
        initial="hidden"
        animate={showText ? 'visible' : 'hidden'}
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
          fontWeight: 300,
          letterSpacing: '0.06em',
          color: '#e8f4f0',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        Crafted for the rare few.
      </motion.p>

      {/* Product label */}
      <motion.p
        variants={textVariants}
        initial="hidden"
        animate={showText ? 'visible' : 'hidden'}
        transition={{ delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Libre Franklin, sans-serif',
          fontSize: 'clamp(0.6rem, 0.9vw, 0.8rem)',
          fontWeight: 400,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#c9a84c',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Diamond Collection
      </motion.p>
    </motion.div>
  );
}

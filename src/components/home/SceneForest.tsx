'use client';

import { useState } from 'react';

import { type Variants, MotionValue, motion, useMotionValueEvent, useTransform } from 'framer-motion';

import VideoScrubber from './VideoScrubber';

interface Props {
  scrollYProgress: MotionValue<number>;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const WORDS = ['Enter', 'the', 'world.'];

export default function SceneForest({ scrollYProgress }: Props) {
  const [showText, setShowText] = useState(false);

  const sceneOpacity = useTransform(scrollYProgress, [0.18, 0.22], [1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShowText(v > 0.05 && v < 0.22);
  });

  return (
    <motion.div style={{ opacity: sceneOpacity, position: 'absolute', inset: 0 }}>
      {/* Fallback gradient — first in DOM = lowest layer, no z-index needed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #050a08 0%, #0a1f14 50%, #050a08 100%)',
        }}
      />

      {/* Scrubbed video — above fallback */}
      <VideoScrubber src="/pendyora/vid-01-forest.mp4" scrollYProgress={scrollYProgress} scrollStart={0} scrollEnd={0.2} />

      {/* Dark vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,10,8,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bioluminescent mist pulse */}
      <motion.div
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 75%, rgba(0,245,196,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* "Enter the world." — staggered word reveal */}
      <div
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate={showText ? 'visible' : 'hidden'}>
          {WORDS.map((word) => (
            <motion.span
              key={word}
              variants={wordVariants}
              style={{
                display: 'inline-block',
                marginRight: '0.35em',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 300,
                letterSpacing: '0.05em',
                color: '#e8f4f0',
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

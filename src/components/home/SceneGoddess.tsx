'use client';

import { useEffect, useState } from 'react';

import { MotionValue, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from 'framer-motion';

import VideoScrubber from './VideoScrubber';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function SceneGoddess({ scrollYProgress }: Props) {
  const [showText, setShowText] = useState(false);

  const rawX = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 80, damping: 20 });

  const textLineOneX = useTransform(springX, (v) => v * 0.015);
  const textLineTwoX = useTransform(springX, (v) => v * 0.04);

  const sceneOpacity = useTransform(scrollYProgress, [0.43, 0.47, 0.63, 0.67], [0, 1, 1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShowText(v > 0.52 && v < 0.65);
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - window.innerWidth / 2);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX]);

  return (
    <motion.div style={{ opacity: sceneOpacity, position: 'absolute', inset: 0 }}>
      {/* Fallback — first = lowest layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #050a08 0%, #0d1f18 50%, #050a08 100%)',
        }}
      />

      {/* Scrubbed video */}
      <VideoScrubber src="/pendyora/vid-02-goddess.mp4" scrollYProgress={scrollYProgress} scrollStart={0.45} scrollEnd={0.65} />

      {/* Teal glow pulse */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 40% 55% at 50% 60%, rgba(0,245,196,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dark vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,10,8,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* "Simply rare." — mouse parallax at 0.015x */}
      <motion.p
        style={{
          x: textLineOneX,
          position: 'absolute',
          top: '30%',
          left: '50%',
          translateX: '-50%',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          fontWeight: 300,
          letterSpacing: '0.04em',
          color: '#e8f4f0',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: showText ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        Simply rare.
      </motion.p>

      {/* "Simply you." — italic, offset right, faster parallax */}
      <motion.p
        style={{
          x: textLineTwoX,
          position: 'absolute',
          top: 'calc(30% + clamp(4rem,8vw,7rem))',
          left: '55%',
          translateX: '-50%',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          color: '#e8f4f0',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: showText ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s',
        }}
      >
        Simply you.
      </motion.p>

      {/* "— Pendyora" signature */}
      <motion.p
        style={{
          position: 'absolute',
          top: 'calc(30% + clamp(7rem,14vw,12.5rem))',
          left: '55%',
          translateX: '-50%',
          fontFamily: 'Libre Franklin, sans-serif',
          fontSize: 'clamp(0.65rem, 1vw, 0.85rem)',
          fontWeight: 400,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#c9a84c',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity: showText ? 1 : 0,
          transition: 'opacity 0.8s ease 0.8s',
        }}
      >
        — Pendyora
      </motion.p>
    </motion.div>
  );
}

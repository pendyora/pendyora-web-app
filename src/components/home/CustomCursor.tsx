'use client';

import { useEffect, useState } from 'react';

import { motion, useMotionValue, useSpring } from 'framer-motion';

type HoverState = 'default' | 'interactive' | 'video';

export default function CustomCursor() {
  const [hoverState, setHoverState] = useState<HoverState>('default');
  const [isTouch, setIsTouch] = useState(true);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);
  const x = useSpring(rawX, { stiffness: 200, damping: 28 });
  const y = useSpring(rawY, { stiffness: 200, damping: 28 });

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - 12);
      rawY.set(e.clientY - 12);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('button') || el.closest('a')) {
        setHoverState('interactive');
      } else if (el.closest('video')) {
        setHoverState('video');
      } else {
        setHoverState('default');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [rawX, rawY]);

  if (isTouch) {
    return null;
  }

  const scale = hoverState === 'video' ? 2.4 : hoverState === 'interactive' ? 1.8 : 1;
  const borderColor = hoverState === 'video' ? '#00f5c4' : '#c9a84c';
  const backgroundColor = hoverState === 'interactive' ? 'rgba(201,168,76,0.2)' : 'transparent';

  return (
    <motion.div
      style={{ x, y, position: 'fixed', width: 24, height: 24, zIndex: 99999, pointerEvents: 'none' }}
      animate={{ scale, borderColor, backgroundColor }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="rounded-full border"
    />
  );
}

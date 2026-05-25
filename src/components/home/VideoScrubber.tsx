'use client';

import { useEffect, useRef } from 'react';

import { MotionValue, motion, useMotionValueEvent, useTransform } from 'framer-motion';

interface VideoScrubberProps {
  src: string;
  scrollYProgress: MotionValue<number>;
  scrollStart: number;
  scrollEnd: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function VideoScrubber({ src, scrollYProgress, scrollStart, scrollEnd, className, style }: VideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // rAF batching: many scroll events per frame collapse into one seek.
  const rafId = useRef<number | null>(null);
  const targetTime = useRef<number>(0);

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, scrollStart - 0.02), scrollStart + 0.01, scrollEnd - 0.01, Math.min(1, scrollEnd + 0.02)],
    [0, 1, 1, 0],
  );

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) {
      return;
    }

    const local = (latest - scrollStart) / (scrollEnd - scrollStart);
    targetTime.current = Math.max(0, Math.min(1, local)) * video.duration;

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        if (videoRef.current) {
          videoRef.current.currentTime = targetTime.current;
        }
      });
    }
  });

  return (
    <motion.video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      style={{
        opacity,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        willChange: 'transform',
        ...style,
      }}
      className={className}
    />
  );
}

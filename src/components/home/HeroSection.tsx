'use client';

import { useRef } from 'react';

import { useScroll } from 'framer-motion';

import CustomCursor from './CustomCursor';
import GrainOverlay from './GrainOverlay';
import SceneCTA from './SceneCTA';
import SceneDragon from './SceneDragon';
import SceneForest from './SceneForest';
import SceneGoddess from './SceneGoddess';
import SceneJewelry from './SceneJewelry';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // scrollYProgress: 0 at top of 500vh container → 1 at bottom
  // Native scroll only — no Lenis. Lenis inertia fights frame-accurate video scrubbing.
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <>
      {/* 500vh scroll track */}
      <div ref={containerRef} style={{ height: '500vh', position: 'relative' }}>
        {/* Sticky stage — 100vh viewport, all scenes composited here */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#050a08',
            cursor: 'none',
          }}
        >
          <SceneForest scrollYProgress={scrollYProgress} />
          <SceneDragon scrollYProgress={scrollYProgress} />
          <SceneGoddess scrollYProgress={scrollYProgress} />
          <SceneJewelry scrollYProgress={scrollYProgress} />
          <SceneCTA scrollYProgress={scrollYProgress} />
          <GrainOverlay />
        </div>
      </div>

      <CustomCursor />
    </>
  );
}

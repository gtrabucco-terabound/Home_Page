import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2 } from 'lucide-react';

export interface WalkthroughStep {
  duration: number;        // ms this step takes
  cursor?: { x: number; y: number };  // 0-100 %
  click?: boolean;         // pulse ripple on cursor
  zoom?: { x: number; y: number; scale: number }; // pan/zoom focus
  callout?: { x: number; y: number; text: string; side?: 'top' | 'bottom' | 'left' | 'right' };
}

interface WalkthroughProps {
  screenshot: string;
  steps: WalkthroughStep[];
  playing: boolean;
  onComplete?: () => void;
}

export function Walkthrough({ screenshot, steps, playing, onComplete }: WalkthroughProps) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [aspect, setAspect] = React.useState<number | null>(null);
  const timerRef = React.useRef<number | null>(null);

  // Reset on play toggle
  React.useEffect(() => {
    if (playing) {
      setStepIdx(0);
    } else {
      setStepIdx(0);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, [playing]);

  // Advance through steps
  React.useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length) {
      onComplete?.();
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setStepIdx((i) => i + 1);
    }, steps[stepIdx].duration);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [stepIdx, playing, steps, onComplete]);

  const step = playing ? steps[Math.min(stepIdx, steps.length - 1)] : undefined;
  const zoom = step?.zoom;
  const cursor = step?.cursor;
  const callout = step?.callout;

  const transform = zoom
    ? `scale(${zoom.scale}) translate(${50 - zoom.x}%, ${50 - zoom.y}%)`
    : 'scale(1) translate(0%, 0%)';

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--card)] flex items-center justify-center">
      {/* Stage: same aspect ratio as image so % coords map to visible pixels */}
      <motion.div
        className="relative overflow-hidden bg-[var(--card)]"
        style={{
          aspectRatio: aspect ?? 16 / 9,
          width: aspect && aspect >= (16 / 9) ? '100%' : 'auto',
          height: aspect && aspect < (16 / 9) ? '100%' : 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          transformOrigin: 'center center',
          transform,
          transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <img
          src={screenshot}
          alt=""
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setAspect(img.naturalWidth / img.naturalHeight);
            }
          }}
          className="absolute inset-0 w-full h-full object-fill"
        />
        {/* Cursor + click ripple zoom WITH the image */}
        <CursorLayer playing={playing} step={step} />
      </motion.div>

      {/* Callout sits OUTSIDE the zoom/clip so it never gets cut */}
      <CalloutLayer playing={playing} step={step} stepIdx={stepIdx} />

      {/* Progress bar (outside the zoomed stage) */}
      {playing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 z-30">
          <motion.div
            className="h-full bg-[var(--primary)]"
            initial={{ width: '0%' }}
            animate={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </div>
  );
}

function CursorLayer({ playing, step }: { playing: boolean; step?: WalkthroughStep }) {
  const cursor = step?.cursor;
  return (
    <>
      <AnimatePresence>
        {playing && cursor && (
          <motion.div
            key="cursor"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              left: { duration: 1, ease: [0.4, 0, 0.2, 1] },
              top: { duration: 1, ease: [0.4, 0, 0.2, 1] },
            }}
            className="absolute z-20 -translate-x-2 -translate-y-2 pointer-events-none"
          >
            <div className="relative">
              <MousePointer2
                size={28}
                fill="white"
                className="text-[var(--primary)] drop-shadow-lg"
                strokeWidth={1.5}
              />
              {step?.click && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[var(--primary)]"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

function CalloutLayer({
  playing,
  step,
  stepIdx,
}: {
  playing: boolean;
  step?: WalkthroughStep;
  stepIdx: number;
}) {
  const callout = step?.callout;
  // Clamp horizontal position so the 220px-wide bubble always stays visible
  const x = callout ? Math.min(Math.max(callout.x, 15), 85) : 50;
  const y = callout ? Math.min(Math.max(callout.y, 8), 88) : 50;
  return (
    <AnimatePresence mode="wait">
      {playing && callout && (
        <motion.div
          key={`callout-${stepIdx}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="absolute z-40 w-[220px] pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium leading-snug">
            {callout.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

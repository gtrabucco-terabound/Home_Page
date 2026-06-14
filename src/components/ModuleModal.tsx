import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2 } from 'lucide-react';
import { Walkthrough, WalkthroughStep } from './Walkthrough';

export interface ModuleData {
  id: string;
  title: string;
  tag: string;
  screenshot: string;
  shortDesc: string;
  longDesc: string;
  bullets: string[];
  audioSrc?: string;
  videoSrc?: string;
  walkthrough?: WalkthroughStep[];
}

interface ModuleModalProps {
  module: ModuleData | null;
  onClose: () => void;
}

export function ModuleModal({ module, onClose }: ModuleModalProps) {
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const stopAll = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  React.useEffect(() => {
    if (!module) stopAll();
    return () => stopAll();
  }, [module, stopAll]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && module) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [module, onClose]);

  const togglePlay = () => {
    if (!module) return;
    if (playing) {
      stopAll();
      return;
    }
    if (module.audioSrc) {
      if (!audioRef.current) audioRef.current = new Audio(module.audioSrc);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.play();
      setPlaying(true);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      // Preferencia: voces neuronales/online > Sabina/Helena > cualquier es-*
      const preferred =
        voices.find((v) => /es-/i.test(v.lang) && /(Natural|Online|Neural)/i.test(v.name)) ||
        voices.find((v) => /es-/i.test(v.lang) && /(Dalia|Elvira|Ximena|Valentina|Mateo)/i.test(v.name)) ||
        voices.find((v) => /es-/i.test(v.lang) && /(Sabina|Helena|Laura)/i.test(v.name)) ||
        voices.find((v) => /^es($|-)/i.test(v.lang));

      const text = `${module.title}. ${module.longDesc} Características clave: ${module.bullets.join('. ')}.`;
      const u = new SpeechSynthesisUtterance(text);
      if (preferred) u.voice = preferred;
      u.lang = preferred?.lang ?? 'es-ES';
      u.rate = 0.9;   // más pausado
      u.pitch = 1.05; // ligeramente más cálido
      u.volume = 1;
      u.onend = () => setPlaying(false);
      utteranceRef.current = u;
      synth.speak(u);
      setPlaying(true);
    }
  };

  return (
    <AnimatePresence>
      {module && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden my-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Video / Walkthrough / Screenshot — in order of preference */}
              <div className="relative bg-black border-b lg:border-b-0 lg:border-r border-[var(--border)] aspect-video lg:aspect-auto lg:min-h-[500px]">
                {module.videoSrc ? (
                  <video
                    key={module.videoSrc}
                    src={module.videoSrc}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                ) : module.walkthrough ? (
                  <Walkthrough
                    screenshot={module.screenshot}
                    steps={module.walkthrough}
                    playing={playing}
                  />
                ) : (
                  <img
                    src={module.screenshot}
                    alt={module.title}
                    className="absolute inset-0 w-full h-full object-cover lg:object-contain"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-8 lg:p-10 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)] mb-3">
                  {module.tag}
                </span>
                <h3 className="text-3xl font-bold mb-3">{module.title}</h3>
                <p className="text-base text-[var(--muted)] mb-6">{module.shortDesc}</p>

                {/* Hide TTS button when a video is provided — the video has its own audio */}
                {!module.videoSrc && (
                  <button
                    onClick={togglePlay}
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity w-fit mb-6"
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                    {playing ? 'Pausar audio' : 'Escuchar explicación'}
                    <Volume2 size={16} className="opacity-70" />
                  </button>
                )}

                <p className="text-sm text-[var(--foreground)] mb-6 leading-relaxed">
                  {module.longDesc}
                </p>

                <ul className="space-y-2">
                  {module.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <span className="text-[var(--primary)] mt-1">▸</span>
                      <span className="text-[var(--muted)]">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

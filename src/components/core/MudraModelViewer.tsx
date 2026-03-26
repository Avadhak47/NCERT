import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface MudraModelViewerProps {
  name: string;
  src: string;
  compact?: boolean;
  label?: string;
  description?: string;
}

const MudraModelViewer = ({ name, src, label = 'Hasta Mudra', description }: MudraModelViewerProps) => {
  const [loaded, setLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

  // Set loaded when component mounts just in case, or use native event listener
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => setLoaded(true);
    viewer.addEventListener('load', handleLoad);

    // Some models might load nearly instantly, fallback timeout just in case
    const timeout = setTimeout(() => setLoaded(true), 1500);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      clearTimeout(timeout);
    };
  }, [src]);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = (time: number) => {
      if (viewerRef.current) {
        // Slow SHM: ~8 seconds per full cycle
        const elapsed = (time - startTime) / 1000;
        const amplitude = 30; // degrees range left/right
        const speed = 0.8; // cycle speed

        // Calculate angle based on sine wave
        const isTwoHand = src.includes('two-hand');
        const baseTheta = isTwoHand ? 90 : 0; // Only adjust camera to face the front for two-hand models
        const angle = baseTheta + Math.sin(elapsed * speed) * amplitude;

        // Update model-viewer's cameraOrbit
        (viewerRef.current as any).cameraOrbit = `${angle}deg 75deg 105%`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [src]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const viewerNode = (
    <>
      {/* Loading shimmer */}
      {!loaded && (
        <div className={`absolute inset-0 flex items-center justify-center bg-white/5 z-10 w-full h-full`}>
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {/* model-viewer element with slow SHM tilt */}
      <model-viewer
        ref={viewerRef as any}
        src={src}
        alt={`3D model of ${name}`}
        camera-controls=""
        interaction-prompt="none"
        shadow-intensity="0.6"
        exposure="1.2"
        touch-action="pan-y"
        loading="lazy"
        camera-orbit={`${src.includes('two-hand') ? 90 : 0}deg 75deg 105%`}
        min-camera-orbit="auto auto auto"
        max-camera-orbit="auto auto auto"
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          outline: 'none',
          ['--poster-color' as string]: 'transparent',
        }}
        onLoad={() => setLoaded(true)}
      />
    </>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={toggleExpand}
        className={`relative group rounded-[2rem] border border-white/50 bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1.5`}
      >
        <div className="relative aspect-[4/5] w-full bg-slate-100/50 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
          {viewerNode}
          
          {/* Expand Icon */}
          <button
            onClick={toggleExpand}
            className="absolute top-3 right-3 bg-white/40 backdrop-blur-md p-2 rounded-full border border-white/40 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hover:bg-white/60 hover:scale-110 shadow-lg z-20"
            aria-label="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Info Area */}
        <div className="p-4 sm:p-5 flex flex-col items-center text-center gap-2 bg-transparent pointer-events-none">
          <span className="text-xs sm:text-sm font-serif font-black text-black tracking-wide uppercase px-2 drop-shadow-sm">{name}</span>
          <p className="text-[10px] sm:text-[11px] leading-tight text-slate-700 italic px-2 line-clamp-3">
            {description || "Cultural hand gesture used in Indian classical dance."}
          </p>
          <div className="mt-1 px-2 py-0.5 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/10">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-brand-primary)]">
              {label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Expanded Viewer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-white/20 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] bg-white/40 backdrop-blur-3xl border border-white/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/20 bg-white/40">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-black">{name}</h3>
                  <span className="text-[var(--color-brand-primary)] font-black uppercase tracking-widest text-[10px] sm:text-xs">
                    {src.includes('two-hand') ? 'Samyukta Hasta (Two Hands)' : 'Asamyukta Hasta (Single Hand)'}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-3 bg-white/40 hover:bg-white/60 rounded-full border border-white/40 transition-all text-black hover:text-red-600 hover:rotate-90 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Expanded Viewer Body */}
              <div className="flex-1 w-full relative flex flex-col md:flex-row bg-transparent">
                <div className="flex-1 h-full relative">
                  <model-viewer
                    src={src}
                    alt={`3D model of ${name}`}
                    camera-controls=""
                    auto-rotate=""
                    rotation-per-second="10deg"
                    shadow-intensity="1"
                    exposure="1.2"
                    camera-orbit={`${src.includes('two-hand') ? 90 : 0}deg 75deg 105%`}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'transparent',
                      outline: 'none',
                      ['--poster-color' as string]: 'transparent',
                    }}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/20 text-black/60 text-xs font-black tracking-widest uppercase pointer-events-none">
                    Drag to rotate • Scroll to zoom
                  </div>
                </div>

                {/* Details Side Panel */}
                <div className="w-full md:w-80 p-6 sm:p-8 bg-white/40 backdrop-blur-md border-t md:border-t-0 md:border-l border-white/20 overflow-y-auto">
                  <h4 className="text-black font-black mb-4 uppercase text-xs tracking-[0.2em] border-b border-black/10 pb-2">Symbolism & Usage</h4>
                  <div className="space-y-4">
                    {description ? (
                      description.split('|').map((part, i) => {
                        const [title, content] = part.split(':');
                        return (
                          <div key={i} className="space-y-1">
                            {content ? (
                              <>
                                <p className="text-[10px] font-black uppercase text-[var(--color-brand-primary)] tracking-widest">{title.trim()}</p>
                                <p className="text-sm text-slate-800 font-medium leading-relaxed">{content.trim()}</p>
                              </>
                            ) : (
                              <p className="text-sm text-slate-800 font-medium leading-relaxed">{part.trim()}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">Detailed cultural documentation for this gesture is integrated into classical Indian dance traditions like Bharatanatyam.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MudraModelViewer;

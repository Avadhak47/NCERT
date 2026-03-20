import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface MudraModelViewerProps {
  name: string;
  src: string;
  compact?: boolean;
  label?: string;
}

const MudraModelViewer = ({ name, src, compact = false, label = 'Hasta Mudra' }: MudraModelViewerProps) => {
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
        shadow-intensity="0.4"
        exposure="1.2"
        touch-action="pan-y"
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
        className={`relative group rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-black/50 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-amber-400/30 transition-all duration-300 cursor-pointer overflow-hidden ${compact ? 'flex-shrink-0' : 'flex flex-col hover:-translate-y-1'}`}
      >
        <div className={`relative ${compact ? 'h-[160px] w-full' : 'h-56 sm:h-64 w-full'} shrink-0 object-contain overflow-hidden`}>
          {viewerNode}
          
          {/* Expand Icon */}
          <button
            onClick={toggleExpand}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 backdrop-blur-xl p-1.5 sm:p-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hover:bg-white/20 hover:scale-110 shadow-xl z-20"
            aria-label="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Name label */}
        <div className={`px-3 ${compact ? 'py-2 absolute bottom-0 w-full' : 'py-3'} bg-gradient-to-t from-black/80 to-transparent pointer-events-none`}>
          <h4 className={`font-serif font-bold text-white drop-shadow-md leading-tight truncate ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>
            {name}
          </h4>
          <p className={`text-amber-400/80 font-bold tracking-widest uppercase mt-0.5 truncate ${compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'}`}>
            {label}
          </p>
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
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-slate-950/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-white/10 to-black/60 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-black/40">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">{name}</h3>
                  <span className="text-amber-400/80 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                    {src.includes('two-hand') ? 'Samyukta Hasta (Two Hands)' : 'Asamyukta Hasta (Single Hand)'}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all text-white hover:text-red-400 hover:rotate-90 hover:scale-105"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Expanded Viewer Body */}
              <div className="flex-1 w-full relative">
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

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/60 text-xs font-bold tracking-widest uppercase pointer-events-none">
                  Drag to rotate • Scroll to zoom
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

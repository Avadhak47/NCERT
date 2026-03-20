import { useState, useRef, useEffect } from 'react';

interface StateModelViewerProps {
  name: string;
  src: string;
  isBackground?: boolean;
}

const StateModelViewer = ({ name, src, isBackground = false }: StateModelViewerProps) => {
  const [loaded, setLoaded] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);

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
        const baseTheta = 90; // Adjust camera to face the front of the 3D model
        const angle = baseTheta + Math.sin(elapsed * speed) * amplitude;

        // Update model-viewer's cameraOrbit
        (viewerRef.current as any).cameraOrbit = `${angle}deg 75deg 105%`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const viewerNode = (
      <model-viewer
        ref={viewerRef as any}
        src={src}
        alt={`3D model of ${name}`}
        camera-controls=""
        interaction-prompt="none"
        shadow-intensity="0.4"
        exposure="1.2"
        touch-action="pan-y"
        camera-orbit="90deg 75deg 105%"
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
  );

  if (isBackground) {
    return (
      <div className="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-screen pointer-events-none flex items-center justify-center overflow-hidden">
        {viewerNode}
      </div>
    );
  }

  return (
    <div className="w-28 h-28 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center justify-center relative shrink-0 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group hover:border-amber-400/50 transition-colors">
      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10 w-full h-full">
          <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {/* model-viewer element with slow SHM tilt */}
      {viewerNode}

      <span className="absolute bottom-1.5 text-[8px] font-bold text-white/60 tracking-widest uppercase pb-1 bg-gradient-to-t from-black/80 w-full text-center">
        3D Tour
      </span>
    </div>
  );
};

export default StateModelViewer;

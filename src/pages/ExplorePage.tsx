import { useEffect, useRef, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import InteractiveMap from '../components/map/InteractiveMap';
import StateTile from '../components/core/StateTile';
import { ScrollContext } from '../contexts/ScrollContext';
import { Sparkles, Eye } from 'lucide-react';
import { useMapEngine } from '../hooks/useMapEngine';
import MudraModelViewer from '../components/core/MudraModelViewer';

// Curated mudras for the Explore page showcase
const EXPLORE_MUDRAS = [
    { name: 'Alapadma', folder: 'single-hand' },
    { name: 'anjali', folder: 'two-hand' },
    { name: 'Pataka', folder: 'single-hand' },
    { name: 'Garuda', folder: 'two-hand' },
    { name: 'Mayura', folder: 'single-hand' },
    { name: 'Chakra', folder: 'two-hand' },
];



const ExplorePage = () => {
    const location = useLocation();
    const { stateId: stateIdParam } = useParams<{ stateId?: string }>();
    const mapContainerRef = useRef<HTMLElement>(null);

    // --- Map Engine Integration ---
    const engine = useMapEngine({
        onStateSelect: () => {
            // Scroll to map when state is selected
            setTimeout(() => {
                if (mapContainerRef.current) {
                    const topOffset = mapContainerRef.current.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: topOffset, behavior: 'smooth' });
                }
            }, 50);
        }
    });

    const {
        activeState,
        activeRegion,
        geoData,
        pois,
        colors,
        actions
    } = engine;



    // Fluid Expansion values
    const scrollRef = useContext(ScrollContext);
    const { scrollY } = useScroll({ container: scrollRef as React.RefObject<HTMLDivElement> });

    const mapWidth = useTransform(scrollY, [150, 450], ['92%', '100%']);
    const mapMaxWidth = useTransform(scrollY, [150, 450], ['100%', '100%']);
    const mapHeight = useTransform(scrollY, [150, 450], ['100vh', '100vh']);
    const mapBorderRadius = useTransform(scrollY, [150, 450], ['40px', '0px']);
    const mapMarginTop = useTransform(scrollY, [150, 450], ['40px', '0px']);
    const mapPaddingBottom = useTransform(scrollY, [150, 450], ['64px', '0px']);

    // Open state page from URL
    useEffect(() => {
        if (stateIdParam) {
            const name = decodeURIComponent(stateIdParam);
            // We use the engine action to navigate
            // Need to map name to exact state name if possible, or engine handles fuzzy match?
            // Engine handles setActiveState directly.
            actions.setActiveState(name);
        }
    }, [stateIdParam, actions]);

    useEffect(() => {
        const state = location.state as { stateId?: string; stateName?: string } | null;
        if (state?.stateId && state?.stateName) {
            actions.navigateToState(state.stateName, state.stateId);
        }
    }, [location.state, actions]);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: !!activeState || !!activeRegion } }));
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } }));
            }
        };
    }, [activeState, activeRegion]);

    return (
        <div className="w-full min-h-full relative flex flex-col pt-4 sm:pt-12 md:pt-0 overflow-x-hidden">

            {/* Content on top of bg - centered hero exactly matching Figma */}
            <div className="relative z-10 flex flex-col items-center w-full pt-28 sm:pt-36 md:pt-40 pb-8">

                {/* Main Title - BHARAT bleeding into top spacing */}
                <div className="relative w-[92%] max-w-5xl flex flex-col items-center px-1">
                    <h1 className="text-5xl min-[480px]:text-6xl sm:text-8xl md:text-[9rem] lg:text-[11rem] xl:text-[14rem] font-serif font-black text-white tracking-tighter leading-[0.8] select-none drop-shadow-2xl text-center">
                        BHARAT
                    </h1>
                    <p className="mt-4 sm:mt-6 md:mt-10 text-[10px] min-[480px]:text-xs sm:text-sm md:text-lg lg:text-xl text-white font-bold font-sans tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.8em] uppercase drop-shadow-lg text-center break-words">
                        THE LAND OF TIMELESS HERITAGE
                    </p>
                </div>

                {/* ═══ 3D Heritage Showcase ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-[92%] max-w-5xl mx-auto mt-6 sm:mt-16 md:mt-24 z-20"
                >
                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-2xl">
                        {/* Background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-400/30 rounded-xl text-amber-400">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-amber-500/90 uppercase block">Explore in 3D</span>
                                    <h3 className="text-lg md:text-xl font-serif font-bold text-white leading-tight">Ancient Hasta Mudras</h3>
                                </div>
                            </div>

                            {/* Horizontal scroll of curated models */}
                            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {EXPLORE_MUDRAS.map(({ name, folder }) => (
                                    <div key={name} className="shrink-0 w-36 sm:w-44">
                                        <MudraModelViewer
                                            name={name}
                                            src={`/models/${folder}/${name}.glb`}
                                            compact
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Map card: Fluid Full-Screen Expansion layout */}
                <motion.section
                    ref={mapContainerRef}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ paddingBottom: activeState ? '0px' : mapPaddingBottom }}
                    className="relative z-10 flex-shrink-0 w-full flex justify-center mt-8 sm:mt-12"
                >
                    <motion.div
                        style={{ width: mapWidth, maxWidth: mapMaxWidth, height: mapHeight, marginTop: mapMarginTop }}
                        className={`mx-auto flex flex-col lg:flex-row gap-6 transition-all duration-700 ease-in-out ${activeState ? '!w-[100vw] !max-w-none !h-auto lg:!h-[calc(100vh-80px)] min-h-[calc(100vh-80px)] !mt-0' : ''}`}
                    >
                        {/* Map container - Transparent Glass container */}
                        <motion.div
                            style={{ borderRadius: mapBorderRadius }}
                            className={`relative bg-white/20 backdrop-blur-2xl shadow-2xl flex flex-col border border-white/30 transition-all duration-700 ease-in-out shrink-0 w-full lg:h-full overflow-hidden lg:overflow-visible ${activeState ? '!rounded-none !border-x-0 !border-b-0' : ''}`}
                        >

                            {/* Regional Tabs Interface */}
                            <div className={`pt-4 px-4 sm:pt-6 sm:px-6 z-20 flex flex-nowrap items-center gap-2 sm:gap-4 transition-all duration-700 ease-in-out shrink-0 bg-transparent lg:rounded-t-[40px] ${activeState ? '!rounded-none' : ''}`}>
                                {/* Scroll container with persistent styling frame to avoid scroll-tear */}
                                <div className="flex gap-2 bg-white/40 p-1.5 rounded-full backdrop-blur-2xl border border-white/40 shadow-sm relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full lg:w-max">
                                    {['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NORTH EAST', 'UNION TERRITORIES'].map(r => {
                                        let regionId = r.charAt(0) + r.slice(1).toLowerCase();
                                        if (r === 'NORTH EAST') regionId = 'Northeast';
                                        if (r === 'UNION TERRITORIES') regionId = 'UT';

                                        return (
                                            <button
                                                key={r}
                                                onClick={() => actions.navigateToRegion(regionId)}
                                                className={`px-3 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest transition-all whitespace-nowrap shrink-0 ${activeRegion === regionId ? 'bg-slate-900 text-white shadow-md' : 'text-slate-800 hover:bg-white/50 hover:shadow-md hover:-translate-y-0.5'}`}
                                            >
                                                {r}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="ml-auto flex gap-2 w-auto shrink-0">
                                    <button
                                        onClick={actions.toggleTheme}
                                        title="Toggle High Contrast"
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Map Viewport & State Info Split */}
                            <div className="flex flex-col lg:flex-row flex-1 w-full relative min-h-0 bg-transparent">
                                <div className={`w-full lg:flex-1 shrink-0 min-h-[280px] sm:min-h-[360px] ${activeState ? 'h-[60vh]' : 'h-full'} lg:h-full relative pt-4 px-4 pb-8 transition-all`}>
                                    <InteractiveMap
                                        activeState={activeState}
                                        activeRegion={activeRegion}
                                        pois={pois}
                                        mapData={geoData}
                                        colors={colors}
                                        onStateClick={actions.navigateToState}
                                        onRegionClick={actions.navigateToRegion}
                                        onBackgroundClick={actions.navigateBack}
                                        onMonumentSelect={actions.setActiveMonumentId}
                                        activeMonumentId={engine.activeMonumentId}
                                    />
                                    {/* Interactive Hint */}
                                    {!activeState && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-[0.2em] font-medium uppercase pointer-events-none text-center">
                                            Click a state on the map to explore its heritage
                                        </div>
                                    )}
                                </div>

                                {/* Split-Screen State Tile - Rendered as flex sibling */}
                                <AnimatePresence mode="wait">
                                    {activeState && (
                                        <motion.div
                                            initial={{ opacity: 0, x: '100%', y: '100%' }}
                                            animate={{ opacity: 1, x: 0, y: 0 }}
                                            exit={{ opacity: 0, x: '100%', y: '100%' }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                            className="w-full lg:w-[53%] shrink-0 lg:h-full z-40 bg-slate-950/80 backdrop-blur-3xl shadow-2xl lg:border-l border-t lg:border-t-0 border-white/20 flex flex-col min-h-[50vh] max-h-[85vh] sm:min-h-[60vh] lg:min-h-0 lg:max-h-none overflow-y-auto"
                                        >
                                            <StateTile
                                                stateId={activeState}
                                                stateName={activeState}
                                                onClose={actions.navigateBack}
                                                activeMonumentId={engine.activeMonumentId}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.section>
            </div>
        </div>
    );
};

export default ExplorePage;

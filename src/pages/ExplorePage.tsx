import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion, useSpring, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import InteractiveMap from '../components/map/InteractiveMap';
import StateTile from '../components/core/StateTile';
import { ScrollContext } from '../components/core/MainLayout';
import { Sparkles, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { useMapEngine } from '../hooks/useMapEngine';

const TRIVIA_FACTS = [
    { title: "World's First University", fact: "Takshashila, founded in 700 BC, was the world's first university, teaching over 60 subjects to 10,500 students from around the globe." },
    { title: "The Game of Chess", fact: "Chess was invented in India before the 6th century AD. It was originally called 'Chaturanga', meaning the four divisions of the military." },
    { title: "Ayurveda", fact: "Ayurveda is humanity's earliest school of medicine, known to have existed for over 5000 years in India." },
    { title: "The Floating Post Office", fact: "India has the largest postal network in the world, including a floating post office on Dal Lake in Srinagar, Kashmir." },
    { title: "Bandhavgarh's Royal Tigers", fact: "Madhya Pradesh is known as the 'Tiger State of India', boasting the highest density of Royal Bengal Tigers in the world at Bandhavgarh National Park." },
    { title: "The Root Bridges", fact: "In Meghalaya, Khasi and Jaintia tribes have trained the roots of rubber trees to grow into natural, living bridges that last for hundreds of years." },
    { title: "Magnetic Hill", fact: "There is a 'Magnetic Hill' in Ladakh that has such a strong magnetic pull that it can pull stationary cars uphill!" },
    { title: "Origins of Yoga", fact: "Yoga originated in ancient India over 5,000 years ago as a physical, mental, and spiritual practice to achieve harmony." },
];

const NumberTicker = ({ value }: { value: number | string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useSpring(0, { stiffness: 80, damping: 25 });
    const isNumber = typeof value === 'number';
    useEffect(() => {
        if (isNumber) motionValue.set(value as number);
    }, [value, motionValue, isNumber]);
    useEffect(() => {
        if (isNumber) {
            return motionValue.on('change', (latest) => {
                if (ref.current) ref.current.textContent = Intl.NumberFormat('en-US').format(Math.round(latest));
            });
        }
    }, [motionValue, isNumber]);
    return <span ref={ref}>{isNumber ? 0 : value}</span>;
};

const ExplorePage = () => {
    const location = useLocation();
    const { stateId: stateIdParam } = useParams<{ stateId?: string }>();
    const [triviaIndex, setTriviaIndex] = useState(0);
    const stats = { states: 36, cultures: 0 };
    const mapContainerRef = useRef<HTMLElement>(null);

    // --- Map Engine Integration ---
    const engine = useMapEngine({
        onStateSelect: (_id, _name) => {
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

    // Trivia rotation
    useEffect(() => {
        const t = setInterval(() => {
            setTriviaIndex(prev => (prev + 1) % TRIVIA_FACTS.length);
        }, 8000);
        return () => clearInterval(t);
    }, []);

    const nextTrivia = () => setTriviaIndex(prev => (prev + 1) % TRIVIA_FACTS.length);
    const prevTrivia = () => setTriviaIndex(prev => (prev - 1 + TRIVIA_FACTS.length) % TRIVIA_FACTS.length);

    // Fluid Expansion values
    const scrollRef = useContext(ScrollContext);
    const { scrollY } = useScroll({ container: scrollRef as React.RefObject<HTMLDivElement> });

    const mapWidth = useTransform(scrollY, [150, 450], ['92%', '100%']);
    const mapMaxWidth = useTransform(scrollY, [150, 450], ['896px', '100%']);
    const mapHeight = useTransform(scrollY, [150, 450], ['75vh', '100vh']);
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
        <div className="w-full min-h-full relative flex flex-col pt-12 md:pt-0">

            {/* Content on top of bg - centered hero exactly matching Figma */}
            <div className="relative z-10 flex flex-col items-center w-full pt-28 sm:pt-36 md:pt-40 pb-8">

                {/* Main Title - BHARAT bleeding into top spacing */}
                <div className="relative w-[92%] max-w-5xl flex flex-col items-center">
                    <h1 className="text-6xl sm:text-8xl md:text-[9rem] lg:text-[11rem] xl:text-[14rem] font-serif font-black text-white tracking-tighter leading-[0.8] select-none drop-shadow-2xl text-center">
                        BHARAT
                    </h1>

                    <p className="mt-6 md:mt-10 text-xs sm:text-sm md:text-lg lg:text-xl text-white font-bold font-sans tracking-[0.4em] sm:tracking-[0.8em] uppercase drop-shadow-lg text-center">
                        THE LAND OF TIMELESS HERITAGE
                    </p>
                </div>

                {/* Live Stats Bar - Compact Glassmorphic Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-2 md:gap-8 mt-8 sm:mt-16 md:mt-24 z-20 w-[92%] max-w-5xl mx-auto px-4 sm:px-8 py-4 md:py-6 bg-gradient-to-b from-white/20 to-black/40 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl"
                >
                    {[
                        { label: 'STATES & UTs', value: stats.states },
                        { label: 'YEARS HISTORY', value: 5000 },
                        { label: 'LANGUAGES', value: 22 },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center text-center">
                            <div className="text-3xl md:text-5xl lg:text-6xl font-serif text-white font-bold drop-shadow-md">
                                <NumberTicker value={stat.value} />{i === 1 ? '+' : ''}
                            </div>
                            <div className="text-[9px] md:text-[10px] lg:text-xs text-white/90 font-bold tracking-[0.2em] mt-2 uppercase">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Cultural Trivia Carousel - Compact */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="w-[92%] max-w-5xl mx-auto mt-4 sm:mt-6 z-20"
                >
                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 sm:p-6 shadow-2xl flex items-center justify-between group">

                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl rounded-full pointer-events-none" />

                        <button onClick={prevTrivia} className="p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/30 z-10 hidden sm:block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        <div className="flex-1 flex flex-col md:flex-row items-center gap-6 md:gap-12 px-2 sm:px-6 relative z-10 w-full overflow-hidden">
                            <div className="flex items-center justify-center p-4 bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-400/30 rounded-2xl shadow-inner shrink-0 text-amber-400">
                                <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={triviaIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="flex flex-col items-center md:items-start text-center md:text-left flex-1"
                                >
                                    <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-amber-500/90 uppercase mb-1 block w-full">Did You Know?</span>
                                    <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-1 leading-tight">
                                        {TRIVIA_FACTS[triviaIndex].title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/80 font-medium leading-relaxed max-w-3xl border-l-[3px] border-amber-500/50 pl-3 md:pl-4 ml-1 py-0.5 italic">
                                        "{TRIVIA_FACTS[triviaIndex].fact}"
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <button onClick={nextTrivia} className="p-2 md:p-3 rounded-full bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/30 z-10 hidden sm:block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
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
                            <div className={`pt-4 px-4 sm:pt-6 sm:px-6 z-20 flex flex-nowrap items-center gap-2 sm:gap-4 transition-all duration-700 ease-in-out shrink-0 bg-slate-950/20 backdrop-blur-sm lg:rounded-t-[40px] ${activeState ? '!rounded-none' : ''}`}>
                                {/* Scroll container with persistent styling frame to avoid scroll-tear */}
                                <div className="flex gap-2 bg-white/40 p-1.5 rounded-full backdrop-blur-2xl border border-white/40 shadow-sm relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full lg:w-max">
                                    {['NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NORTH EAST'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => actions.navigateToRegion(r === 'NORTH EAST' ? 'Northeast' : r.charAt(0) + r.slice(1).toLowerCase())}
                                            className={`px-3 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest transition-all whitespace-nowrap shrink-0 ${activeRegion === (r === 'NORTH EAST' ? 'Northeast' : r.charAt(0) + r.slice(1).toLowerCase()) ? 'bg-slate-900 text-white shadow-md' : 'text-slate-800 hover:bg-white/50 hover:shadow-md hover:-translate-y-0.5'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
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
                                <div className={`w-full lg:flex-1 shrink-0 ${activeState ? 'h-[60vh]' : 'h-full'} lg:h-full relative pt-4 px-4 pb-8 transition-all`}>
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
                                            className="w-full lg:w-[53%] shrink-0 lg:h-full z-40 bg-slate-950/80 backdrop-blur-3xl shadow-2xl lg:border-l border-t lg:border-t-0 border-white/20 flex flex-col h-[85vh] lg:min-h-0"
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

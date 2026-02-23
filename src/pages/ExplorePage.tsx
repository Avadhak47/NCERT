import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import InteractiveMap from '../components/map/InteractiveMap';
import StateTile from '../components/core/StateTile';
import { getFallbackImage } from '../utils/fallbackImages';

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

// Auto-rotating heritage images: India Gate, Mumbai, Uttar Pradesh, Temple
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop', // India Gate, New Delhi
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2071&auto=format&fit=crop', // Gateway of India, Mumbai
    'https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=2072&auto=format&fit=crop', // Sanchi Stupa, Madhya Pradesh
    'https://images.unsplash.com/photo-1621360241119-c7520141680d?q=80&w=2070&auto=format&fit=crop', // Shore Temple, Mahabalipuram
    'https://images.unsplash.com/photo-1580126435011-37d457b01b22?q=80&w=2070&auto=format&fit=crop', // Konark Sun Temple, Odisha
];



const ROTATE_BG_MS = 5500;

const ExplorePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { stateId: stateIdParam } = useParams<{ stateId?: string }>();
    const [selectedState, setSelectedState] = useState<{ id: string, name: string } | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [bgImageIndex, setBgImageIndex] = useState(0);
    const stats = { states: 36, cultures: 0 };

    // Open state page from URL (e.g. /explore/Rajasthan)
    useEffect(() => {
        if (stateIdParam) {
            const name = decodeURIComponent(stateIdParam);
            setSelectedState({ id: name, name });
        }
    }, [stateIdParam]);

    useEffect(() => {
        const state = location.state as { stateId?: string; stateName?: string } | null;
        if (state?.stateId && state?.stateName) setSelectedState({ id: state.stateId, name: state.stateName });
    }, [location.state]);

    useEffect(() => {
        const t = setInterval(() => {
            setBgImageIndex((i) => (i + 1) % HERO_IMAGES.length);
        }, ROTATE_BG_MS);
        return () => clearInterval(t);
    }, []);

    const handleStateSelect = (stateId: string, stateName: string) => {
        if (!stateId) {
            setSelectedState(null);
            navigate('/explore', { replace: true });
        } else {
            setSelectedState({ id: stateId, name: stateName });
            navigate(`/explore/${encodeURIComponent(stateId)}`, { replace: false });
        }
    };

    const handleRegionSelect = (regionName: string | null) => {
        setSelectedRegion(regionName);
    };

    const handleCloseTile = () => {
        setSelectedState(null);
        navigate('/explore', { replace: true });
    };



    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: !!selectedState || !!selectedRegion } }));
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } }));
            }
        };
    }, [selectedState, selectedRegion]);

    return (
        <div className="w-full min-h-full relative flex flex-col">
            {/* Full-page rotating heritage bg - fills viewport beautifully */}
            <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={bgImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                        className="absolute inset-0 min-w-full min-h-full"
                    >
                        <img
                            src={HERO_IMAGES[bgImageIndex]}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(); }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/25 to-black/70" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_0%,rgba(15,23,42,0.4)_100%)]" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Content on top of bg - centered hero like Bharat Heritage Portal */}
            <div className="relative z-10 flex flex-col min-h-full items-center pt-8 sm:pt-12 pb-8">
                {/* Ministry of Culture Initiative - pill with tricolour */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/50 dark:bg-white/10 border border-slate-200/80 dark:border-white/20 backdrop-blur-md mb-6 sm:mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                >
                    <div className="flex space-x-1">
                        <span className="w-1.5 h-3.5 bg-ncert-saffron rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                        <span className="w-1.5 h-3.5 bg-white rounded-full animate-[pulse_1.5s_ease-in-out_0.2s_infinite]" />
                        <span className="w-1.5 h-3.5 bg-ncert-green rounded-full animate-[pulse_1.5s_ease-in-out_0.4s_infinite]" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white tracking-[0.2em] uppercase">Ministry of Culture Initiative</span>
                </motion.div>

                {/* Main Title - white text, gold on hover */}
                <div className="group relative z-10 flex flex-col items-center w-full overflow-visible text-center cursor-default">
                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[11rem] xl:text-[13rem] font-serif font-bold text-white tracking-tighter leading-[0.85] select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_40px_rgba(0,0,0,0.25)] transition-colors duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.4),0_0_50px_rgba(251,191,36,0.3)]">
                        BHARAT
                    </h1>

                    {/* Golden glow behind text (dark mode) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.5, scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-ncert-saffron/80 blur-[100px] -z-10 rounded-full mix-blend-screen hidden dark:block"
                    />

                    {/* Decorative divider - saffron line */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '160px', opacity: 1 }}
                        transition={{ delay: 1, duration: 1.2, ease: 'circOut' }}
                        className="h-1.5 bg-gradient-to-r from-transparent via-ncert-saffron to-transparent mt-6 sm:mt-8 rounded-full"
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="mt-4 sm:mt-6 text-sm md:text-lg lg:text-xl text-white font-medium font-sans tracking-[0.35em] sm:tracking-[0.4em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.25)] transition-colors duration-300 group-hover:text-amber-400 group-hover:drop-shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_30px_rgba(251,191,36,0.25)]"
                    >
                        THE LAND OF TIMELESS HERITAGE
                    </motion.p>
                </div>

                {/* Live Stats Bar - glassmorphism card, 3 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="grid grid-cols-3 gap-6 md:gap-12 mt-12 sm:mt-16 md:mt-24 z-20 w-full max-w-4xl mx-auto px-6 sm:px-12 py-5 sm:py-8 bg-white/70 dark:bg-black/25 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 shadow-xl"
                >
                    {[
                        { label: 'STATES & UTs', value: stats.states },
                        { label: 'YEARS HISTORY', value: 5000 },
                        { label: 'LANGUAGES', value: 22 },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="flex flex-col items-center group cursor-default relative py-2"
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute inset-0 bg-ncert-saffron/5 group-hover:bg-ncert-saffron/10 blur-2xl rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100" />

                            <motion.div
                                className="text-3xl md:text-5xl font-serif text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10"
                                whileHover={{
                                    scale: 1.1,
                                    color: '#FF9933',
                                    textShadow: '0 0 25px rgba(255, 153, 51, 0.6)',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                <NumberTicker value={stat.value} />{i === 1 ? '+' : ''}
                            </motion.div>
                            <div className="text-[9px] md:text-xs text-slate-700 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white tracking-[0.15em] mt-2 font-bold relative z-10 transition-colors duration-300">{stat.label}</div>

                            <motion.div
                                className="h-0.5 bg-gradient-to-r from-transparent via-ncert-saffron to-transparent mt-2 rounded-full absolute -bottom-2"
                                initial={{ width: 0, opacity: 0 }}
                                whileHover={{ width: '80%', opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Map card: region filters + legend + map (Bharat Heritage style) */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="relative z-10 flex-shrink-0 px-4 sm:px-6 md:px-12 mt-4 sm:mt-6 pb-8"
                >
                    <div className="rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200/80 overflow-hidden max-w-5xl mx-auto">


                        {/* Map container - bg extends behind via fixed layer */}
                        <div className="relative min-h-[55vh] sm:min-h-[60vh] bg-slate-900/40 backdrop-blur-[2px]">
                            <InteractiveMap
                                onStateSelect={handleStateSelect}
                                onRegionSelect={handleRegionSelect}
                                activeStateId={selectedState?.id || null}
                            />
                        </div>
                    </div>
                </motion.section>

                {selectedState && (
                    <div className="fixed inset-0 z-50 bg-white">
                        <StateTile
                            stateId={selectedState.id}
                            stateName={selectedState.name}
                            onClose={handleCloseTile}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


export default ExplorePage;

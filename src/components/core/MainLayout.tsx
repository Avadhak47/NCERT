import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Map, Clock, Image as ImageIcon, Gamepad2, Book, Info, Send, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import statesData from '../../data/states.json';
import { getFallbackImage } from '../../utils/fallbackImages';
import { ScrollContext } from '../../contexts/ScrollContext';

// Auto-rotating heritage images for global background
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop', // India Gate, New Delhi
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2071&auto=format&fit=crop', // Gateway of India, Mumbai
    'https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=2072&auto=format&fit=crop', // Sanchi Stupa, Madhya Pradesh
    'https://images.unsplash.com/photo-1621360241119-c7520141680d?q=80&w=2070&auto=format&fit=crop', // Shore Temple, Mahabalipuram
    'https://images.unsplash.com/photo-1580126435011-37d457b01b22?q=80&w=2070&auto=format&fit=crop', // Konark Sun Temple, Odisha
];

const ROTATE_BG_MS = 5500;

const navItems = [
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/timeline', label: 'Timeline', icon: Clock },
    { to: '/artforms', label: 'Art Forms', icon: ImageIcon },
    { to: '/games', label: 'Games', icon: Gamepad2 },
    { to: '/glossary', label: 'Glossary', icon: Book },
    { to: '/acknowledgement', label: 'Credits', icon: Info },
];

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [bgImageIndex, setBgImageIndex] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Scroll tracking
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });

    // Continuous interpolations using 0 to 150px scroll range
    const navWidth = useTransform(scrollY, [0, 150], ['90%', '100%']);
    const navMaxWidth = useTransform(scrollY, [0, 150], ['1024px', '100%']); // max-w-5xl to 100%
    const navBorderRadius = useTransform(scrollY, [0, 150], ['9999px', '0px']);
    const navTop = useTransform(scrollY, [0, 150], ['16px', '0px']);
    const navPadding = useTransform(scrollY, [0, 150], ['12px 24px', '16px 24px']);
    const navBgBlur = useTransform(scrollY, [0, 150], [16, 24]);
    const navBgOpacity = useTransform(scrollY, [0, 150], [0.8, 0.95]);
    const backgroundStyle = useMotionTemplate`rgba(255, 255, 255, ${navBgOpacity})`;
    const backdropFilterStyle = useMotionTemplate`blur(${navBgBlur}px)`;

    // Elements crossfading
    const centerNavOpacity = useTransform(scrollY, [0, 80], [1, 0]);
    const centerNavY = useTransform(scrollY, [0, 80], [0, -10]);

    const compactNavOpacity = useTransform(scrollY, [70, 150], [0, 1]);
    const compactNavX = useTransform(scrollY, [70, 150], [-10, 0]);

    // When at top of page: center nav is visible — nav links get clicks; compact must not block.
    // When scrolled: compact logo is visible — compact gets clicks.
    const navElementsPointerEvents = useTransform(scrollY, [0, 100], ['auto', 'none']);
    const compactElementsPointerEvents = useTransform(scrollY, [0, 80], ['none', 'auto']);

    useEffect(() => {
        const t = setInterval(() => {
            setBgImageIndex((i) => (i + 1) % HERO_IMAGES.length);
        }, ROTATE_BG_MS);
        return () => clearInterval(t);
    }, []);

    const handleExploreRandomState = () => {
        const states = statesData.states;
        if (states.length === 0) {
            navigate('/explore');
            return;
        }
        const random = states[Math.floor(Math.random() * states.length)];
        navigate(`/explore/${encodeURIComponent(random.name)}`);
    };

    const handleNavClick = (path: string) => {
        const target = path.startsWith('/') ? path : `/${path}`;
        navigate(target);
    };

    return (
        <div className="flex flex-col w-full h-full overflow-hidden bg-slate-900 text-[var(--color-text-main)] font-sans relative">
            {/* Global Full-page rotating heritage bg */}
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
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/40 to-black/80" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_0%,rgba(15,23,42,0.6)_100%)]" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Glassmorphism Navbar (Continuous Scroll) */}
            <motion.header
                style={{ width: navWidth, maxWidth: navMaxWidth, top: navTop }}
                className="absolute left-1/2 -translate-x-1/2 z-[100]"
            >
                <motion.div
                    style={{ borderRadius: navBorderRadius, backgroundColor: backgroundStyle, backdropFilter: backdropFilterStyle, padding: navPadding }}
                    className="border border-white/50 shadow-lg flex items-center justify-between"
                >
                    <div className="flex items-center justify-between w-full relative min-h-[44px] sm:min-h-[42px]">
                        {/* Left Side: Center Nav Elements vs Compact Logo */}
                        <div className="flex items-center flex-1 h-full">
                            <motion.nav
                                style={{ opacity: centerNavOpacity, y: centerNavY, pointerEvents: navElementsPointerEvents }}
                                className="absolute left-0 z-10 flex items-center gap-1 sm:gap-2"
                            >
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 px-2.5 sm:px-3 py-2.5 sm:py-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all rounded-full min-h-[44px] sm:min-h-0 justify-center"
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="hidden lg:inline">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </motion.nav>

                            <motion.button
                                style={{ opacity: compactNavOpacity, x: compactNavX, pointerEvents: compactElementsPointerEvents }}
                                type="button"
                                onClick={() => handleNavClick('/explore')}
                                className="absolute left-0 flex items-center gap-2 text-slate-900 font-semibold px-2 rounded-full hover:opacity-80 transition-opacity"
                            >
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white">
                                    <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                                </span>
                                <span className="hidden sm:block font-serif tracking-tight text-xl font-black">Solidroad</span>
                            </motion.button>
                        </div>

                        {/* Center Side: Logo (Original State) */}
                        <motion.div
                            style={{ opacity: centerNavOpacity, y: centerNavY, pointerEvents: navElementsPointerEvents }}
                            className="absolute left-1/2 -translate-x-1/2"
                        >
                            <button
                                type="button"
                                onClick={() => handleNavClick('/explore')}
                                className="flex items-center gap-2 text-slate-900 font-semibold px-4 rounded-full hover:opacity-80 transition-opacity"
                            >
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white">
                                    <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                                </span>
                                <span className="hidden sm:block font-serif tracking-tight text-xl font-black">Solidroad</span>
                            </button>
                        </motion.div>

                        {/* Right Side: Language + CTA + Compact Hamburger */}
                        <div className="flex items-center justify-end gap-2 flex-1 h-full">
                            <LanguageSelector />
                            <button
                                type="button"
                                onClick={handleExploreRandomState}
                                className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 font-medium text-sm transition-colors rounded-full shadow-sm"
                            >
                                <Map className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Explore</span>
                            </button>

                            {/* Collapsed Dropdown Hamburger Container */}
                            <motion.div style={{ opacity: compactNavOpacity, pointerEvents: compactElementsPointerEvents }} className="flex overflow-hidden rtl items-center">
                                <motion.button
                                    style={{ width: useTransform(scrollY, [70, 150], [0, 48]), paddingLeft: useTransform(scrollY, [70, 150], [0, 8]) }}
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="flex items-center justify-end text-slate-900 hover:text-slate-600 focus:outline-none overflow-hidden"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-inner">
                                        <Menu className="w-5 h-5 shrink-0" />
                                    </div>
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.header>

            {/* Mobile / Compact Dropdown Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-20 right-4 sm:right-6 w-[min(16rem,calc(100vw-2rem))] max-h-[calc(100vh-6rem)] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-4 z-[101] flex flex-col gap-2 origin-top-right"
                    >
                        <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Navigation</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 font-medium text-sm transition-all rounded-xl w-full text-left"
                                >
                                    <Icon className="w-5 h-5 shrink-0 text-[var(--color-brand-primary)] opacity-80" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <ScrollContext.Provider value={scrollRef}>
                <main ref={scrollRef} id="main-scroll-container" className="flex-1 w-full h-full relative overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col min-h-0 pt-20 sm:pt-24 pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full h-full overflow-y-auto scroll-smooth relative flex flex-col pointer-events-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </ScrollContext.Provider>
        </div >
    );
};

export default MainLayout;

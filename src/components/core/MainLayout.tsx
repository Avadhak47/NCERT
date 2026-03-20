import { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { Map, Clock, Image as ImageIcon, Gamepad2, Book, Compass, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { ScrollContext } from '../../contexts/ScrollContext';

const navItems = [
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/timeline', label: 'Timeline', icon: Clock },
    { to: '/artforms', label: 'Art Forms', icon: ImageIcon },
    { to: '/games', label: 'Games', icon: Gamepad2 },
    { to: '/glossary', label: 'Glossary', icon: Book },
];

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Scroll tracking
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollRef });

    // Navbar glass effect intensifies on scroll
    const navBgOpacity = useTransform(scrollY, [0, 150], [0.6, 0.92]);
    const navBgBlur = useTransform(scrollY, [0, 150], [12, 24]);
    const backgroundStyle = useMotionTemplate`rgba(15, 23, 42, ${navBgOpacity})`;
    const backdropFilterStyle = useMotionTemplate`blur(${navBgBlur}px)`;

    const handleNavClick = (path: string) => {
        const target = path.startsWith('/') ? path : `/${path}`;
        navigate(target);
    };

    return (
        <div className="flex flex-col w-full h-full overflow-hidden bg-slate-900 text-[var(--color-text-main)] font-sans relative">
            {/* Global Full-page static heritage bg */}
            <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
                <img
                    src="/bg-image.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-slate-900/40 to-black/80" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_0%,rgba(15,23,42,0.6)_100%)]" />
            </div>

            {/* ══════ Floating Glassmorphism Navbar ══════ */}
            <motion.header
                style={{ backgroundColor: backgroundStyle, backdropFilter: backdropFilterStyle }}
                className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 shadow-lg"
            >
                <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 h-14 sm:h-16">

                    {/* Left: Logo + Site Name */}
                    <button
                        type="button"
                        onClick={() => handleNavClick('/explore')}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
                    >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-brand-primary)] text-white shadow-sm ring-1 ring-white/20">
                            <Compass className="w-4 h-4" />
                        </span>
                        <span className="font-serif tracking-tight text-xl font-black text-white drop-shadow-md">Virasat</span>
                    </button>

                    {/* Center: Nav Links (hidden on mobile) */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 font-medium text-sm whitespace-nowrap transition-all rounded-full ${
                                        isActive
                                            ? 'bg-white/15 text-white shadow-sm'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Language + Mobile Menu */}
                    <div className="flex items-center gap-2">
                        <LanguageSelector />

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Dropdown Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 right-3 w-[min(16rem,calc(100vw-1.5rem))] max-h-[calc(100vh-5rem)] overflow-y-auto bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-3 z-[101] flex flex-col gap-1 origin-top-right md:hidden"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all rounded-xl w-full text-left ${
                                        isActive
                                            ? 'bg-white/15 text-white'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 shrink-0 opacity-80" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content — Full screen, scrolls behind navbar */}
            <ScrollContext.Provider value={scrollRef}>
                <main ref={scrollRef} id="main-scroll-container" className="flex-1 w-full h-full relative overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col min-h-0 pointer-events-auto">
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

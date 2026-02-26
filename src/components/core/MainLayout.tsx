import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Map, Clock, Image as ImageIcon, Gamepad2, Book, Info, MessageCircle, Send, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import statesData from '../../data/states.json';

const navItems = [
    { to: '/timeline', label: 'Timeline', icon: Clock },
    { to: '/artforms', label: 'Art Forms', icon: ImageIcon },
    { to: '/games', label: 'Games', icon: Gamepad2 },
    { to: '/glossary', label: 'Glossary', icon: Book },
];

const MainLayout = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        setMobileMenuOpen(false);
        const target = path.startsWith('/') ? path : `/${path}`;
        window.location.href = target;
    };

    return (
        <div className="flex flex-col w-full h-full overflow-hidden bg-[var(--color-surface-warm)] text-[var(--color-text-main)] font-sans relative">
            {/* Responsive navbar */}
            <header className="sticky top-0 z-[100] w-full shrink-0 py-2 sm:py-3 px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="w-full max-w-[min(100%,80rem)] mx-auto">
                    <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 md:px-6 rounded-2xl border border-white/50 bg-white/75 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
                        {/* Left: Nav links (hidden on mobile, scrollable on tablet) */}
                        <nav className="hidden md:flex items-center gap-1.5 sm:gap-2 lg:gap-4 min-w-0 overflow-x-auto no-scrollbar">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.to}
                                        type="button"
                                        onClick={() => handleNavClick(item.to)}
                                        className="flex items-center gap-1 text-[#45556C] hover:text-[#1D293D] font-medium text-xs sm:text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded py-1"
                                    >
                                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Mobile: hamburger */}
                        <div className="flex md:hidden items-center min-w-0">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 -ml-2 rounded-lg text-[#45556C] hover:bg-white/60 hover:text-[#1D293D] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Center: Logo + app title */}
                        <div className="flex justify-center min-w-0">
                            <button
                                type="button"
                                onClick={() => handleNavClick('/explore')}
                                className="flex items-center gap-2 text-[#1D293D] font-semibold text-base sm:text-lg hover:text-[#45556C] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
                            >
                                <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded bg-slate-100/80 text-[#45556C] shrink-0">
                                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </span>
                                <span className="font-serif font-bold truncate">Digital India</span>
                            </button>
                        </div>

                        {/* Right: Explore → Credits → Language (hidden on mobile; in drawer) */}
                        <div className="hidden md:flex items-center justify-end gap-1.5 sm:gap-2 lg:gap-4 min-w-0">
                            <button
                                type="button"
                                onClick={handleExploreRandomState}
                                className="flex items-center gap-1 text-[#45556C] hover:text-[#1D293D] font-medium text-xs sm:text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded py-1"
                            >
                                <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span>Explore</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavClick('/acknowledgement')}
                                className="flex items-center gap-1 text-[#45556C] hover:text-[#1D293D] font-medium text-xs sm:text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded py-1"
                            >
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                <span>Credits</span>
                            </button>
                            <LanguageSelector />
                        </div>
                        {/* Spacer on mobile so center logo stays centered */}
                        <div className="flex md:hidden w-10 shrink-0" aria-hidden="true" />
                    </div>
                </div>

                {/* Mobile menu overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-[99] md:hidden"
                        aria-hidden="true"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                    </div>
                )}
                {/* Mobile menu panel */}
                <div
                    className={`fixed top-[calc(3.5rem+8px)] left-3 right-3 z-[99] md:hidden rounded-2xl border border-white/50 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-200 ease-out ${
                        mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    }`}
                >
                    <nav className="py-3 px-2 max-h-[70vh] overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.to}
                                    type="button"
                                    onClick={() => handleNavClick(item.to)}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#45556C] hover:bg-slate-100/80 hover:text-[#1D293D] font-medium text-sm rounded-xl transition-colors"
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                        <div className="border-t border-slate-200/80 my-2" />
                        <button
                            type="button"
                            onClick={handleExploreRandomState}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#45556C] hover:bg-slate-100/80 hover:text-[#1D293D] font-medium text-sm rounded-xl transition-colors"
                        >
                            <Map className="w-5 h-5 shrink-0" />
                            <span>Explore</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavClick('/acknowledgement')}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#45556C] hover:bg-slate-100/80 hover:text-[#1D293D] font-medium text-sm rounded-xl transition-colors"
                        >
                            <Info className="w-5 h-5 shrink-0" />
                            <span>Credits</span>
                        </button>
                        <div className="border-t border-slate-200/80 my-2" />
                        <div className="px-4 py-2">
                            <LanguageSelector />
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-scroll-container" className="flex-1 w-full h-full relative overflow-y-auto scroll-smooth flex flex-col min-h-0 pt-0 pb-0">
                <Outlet />
            </main>

            {/* FAB - chat */}
            <footer className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <button
                    type="button"
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:ring-offset-2"
                    aria-label="Need help? Chat"
                >
                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
            </footer>
        </div>
    );
};

export default MainLayout;

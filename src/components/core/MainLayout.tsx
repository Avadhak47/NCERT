import { Outlet, useNavigate } from 'react-router-dom';
import { Map, Clock, Image as ImageIcon, Gamepad2, Book, Info, MessageCircle, Send } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import statesData from '../../data/states.json';

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
        window.location.href = target;
    };

    return (
        <div className="flex flex-col w-full h-full overflow-hidden bg-[var(--color-surface-warm)] text-[var(--color-text-main)] font-sans relative">
            {/* Solid white navbar - same on all pages */}
            <header className="sticky top-0 z-[100] w-full bg-white border-b border-slate-200/80 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 h-16 sm:h-18">
                        {/* Left: Nav links (Products/Customers/Careers style) */}
                        <nav className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar min-w-0">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.to}
                                        type="button"
                                        onClick={() => handleNavClick(item.to)}
                                        className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Center: Logo + app title (Solidroad-style) */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => handleNavClick('/explore')}
                                className="flex items-center gap-2 text-slate-900 font-semibold text-lg hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
                            >
                                <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-700">
                                    <Send className="w-4 h-4" />
                                </span>
                                <span className="hidden sm:inline font-serif font-bold">Digital India</span>
                            </button>
                        </div>

                        {/* Right: Language (hover dropdown) + Explore (random state) */}
                        <div className="flex items-center justify-end gap-4">
                            <LanguageSelector />
                            <button
                                type="button"
                                onClick={handleExploreRandomState}
                                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
                            >
                                <Map className="w-4 h-4 shrink-0" />
                                <span>Explore</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-scroll-container" className="flex-1 w-full h-full relative overflow-y-auto scroll-smooth flex flex-col min-h-0 pt-16 pb-24">
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

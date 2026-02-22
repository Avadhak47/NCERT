import { Outlet, NavLink } from 'react-router-dom';
import { Volume2, VolumeX, Map, Clock, Image as ImageIcon, Gamepad2, Book, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';

const MainLayout = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // We use the main container for scrolling on most pages
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.scrollTop > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        const mainElement = document.getElementById('main-scroll-container');
        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
        }

        const handleForceCollapse = (e: any) => {
            setIsScrolled(e.detail.collapsed);
        };
        window.addEventListener('nav-collapse', handleForceCollapse);

        return () => {
            if (mainElement) mainElement.removeEventListener('scroll', handleScroll);
            window.removeEventListener('nav-collapse', handleForceCollapse);
        };
    }, []);

    const toggleMute = () => setIsMuted(prev => !prev);

    const navItems = [
        { to: '/explore', label: 'Explore', icon: <Map className="w-5 h-5" /> },
        { to: '/timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
        { to: '/artforms', label: 'Art Forms', icon: <ImageIcon className="w-5 h-5" /> },
        { to: '/games', label: 'Games', icon: <Gamepad2 className="w-5 h-5" /> },
        { to: '/glossary', label: 'Glossary', icon: <Book className="w-5 h-5" /> },
        { to: '/acknowledgement', label: 'Credits', icon: <Info className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col w-full h-full overflow-hidden bg-[var(--color-surface-warm)] text-[var(--color-text-main)] font-sans relative">

            {/* Floating Header - Sleek Gen-Z Pill Style */}
            <div className={`absolute top-0 w-full z-[100] flex justify-center transition-all duration-500 pt-6 px-4 pointer-events-none`}>
                <header className={`pointer-events-auto bg-white/80 backdrop-blur-xl border-b-2 sm:border sm:border-slate-200/50 flex justify-between items-center shadow-xl transition-all duration-500 overflow-hidden
                    ${isScrolled
                        ? 'w-[95%] sm:w-auto sm:rounded-full py-2 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/95'
                        : 'w-full sm:w-[96%] sm:rounded-full px-6 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
                    }`}
                >
                    <div className="flex items-center gap-3 shrink-0">
                        <div className={`rounded-full bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center shadow-inner text-white transition-all duration-500
                            ${isScrolled ? 'w-8 h-8 opacity-90' : 'w-10 h-10 hover:scale-110'}`}>
                            <span className="font-serif font-black text-lg">DI</span>
                        </div>
                        <h1 className={`font-serif font-bold tracking-tight text-[var(--color-brand-primary)] hidden lg:block transition-all duration-500
                            ${isScrolled ? 'w-0 opacity-0 -ml-3' : 'text-2xl w-auto opacity-100'}`}>
                            Digital India
                        </h1>
                    </div>

                    <nav className={`flex items-center gap-1 md:gap-2 mx-4 overflow-x-auto no-scrollbar transition-all duration-500
                        ${isScrolled ? 'bg-transparent' : 'bg-slate-50/50 rounded-full px-2 py-1 border border-slate-100'}`}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-full transition-all duration-300 font-bold whitespace-nowrap 
                                     ${isScrolled ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'}
                                     ${isActive
                                        ? 'bg-slate-900 text-white shadow-md scale-105 transform hover:-translate-y-0.5'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-0.5'
                                    }`
                                }
                                aria-label={item.label}
                                title={item.label}
                            >
                                {item.icon}
                                <span className={`hidden xl:inline transition-all duration-300 ${isScrolled ? 'text-xs tracking-tight' : 'text-sm'}`}>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <LanguageSelector />
                        <button
                            onClick={toggleMute}
                            className={`rounded-full bg-transparent border-2 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900 transition-all focus-visible:outline-none focus:ring-2 focus:ring-slate-900 flex items-center justify-center
                                ${isScrolled ? 'w-8 h-8 border' : 'w-10 h-10 hover:scale-110'}`}
                            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                        >
                            {isMuted ? <VolumeX className={isScrolled ? "w-4 h-4" : "w-5 h-5"} /> : <Volume2 className={isScrolled ? "w-4 h-4" : "w-5 h-5"} />}
                        </button>
                    </div>
                </header>
            </div>

            {/* Main Content Area */}
            <main id="main-scroll-container" className="flex-1 w-full h-full relative pt-24 pb-0 overflow-y-auto scroll-smooth flex flex-col">
                <Outlet />
            </main>

            {/* Footer Controls with Companion Widget */}
            <footer className="absolute bottom-4 right-6 z-50">
                <div className="flex items-center gap-3 bg-white border-4 border-[var(--color-brand-accent)] rounded-full pl-4 pr-2 py-2 hover:bg-[var(--color-surface-muted)] transition-colors shadow-xl group cursor-pointer animate-bounce">
                    <span className="text-sm font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-accent)]">Need help?</span>
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--color-surface-warm)] flex items-center justify-center border-2 border-[var(--color-brand-accent)] group-hover:scale-110 transition-transform">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=CompanionGuide&backgroundColor=transparent" alt="Companion Guide character" className="w-10 h-10" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;

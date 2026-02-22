import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import timelineData from '../data/timeline.json';

const TimelinePage = () => {
    const [activeItem, setActiveItem] = useState<any>(null);
    const [expandedEraId, setExpandedEraId] = useState<string | null>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeItem && itemRefs.current[activeItem.id] && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const el = itemRefs.current[activeItem.id];

            if (el) {
                let start = Date.now();
                // 60fps polling to match the 500ms CSS transition
                const interval = setInterval(() => {
                    if (Date.now() - start > 600) {
                        clearInterval(interval);
                        return;
                    }
                    if (!el) return;

                    const padding = window.innerWidth > 768 ? 64 : 24;
                    const elRect = el.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // If element bleeds left
                    if (elRect.left < containerRect.left + padding) {
                        container.scrollBy({ left: elRect.left - (containerRect.left + padding) });
                    }
                    // If element bleeds right
                    else if (elRect.right > containerRect.right - padding) {
                        const nudge = elRect.right - (containerRect.right - padding);
                        // Prevent the nudge from pushing the left edge too far out
                        if (elRect.left - nudge >= containerRect.left + padding) {
                            container.scrollBy({ left: nudge });
                        } else {
                            // If it's wider than the container, guarantee left edge alignment
                            container.scrollBy({ left: elRect.left - (containerRect.left + padding) });
                        }
                    }
                }, 16);

                return () => clearInterval(interval);
            }
        }
    }, [activeItem]);

    // Dynamic array that injects events only for the active era
    const timelineItems = useMemo(() => {
        let items: any[] = [];
        timelineData.periods.forEach(period => {
            // Push Era marker
            items.push({
                id: period.id,
                type: 'era',
                yearVal: period.years,
                period: period.years,
                title: period.name,
                desc: period.description
            });
            // Push Event markers only if the era is expanded
            if (expandedEraId === period.id) {
                if (period.highlights) {
                    period.highlights.forEach((hl, i) => {
                        items.push({
                            id: `${period.id}-hl-${i}`,
                            type: 'event',
                            title: hl.name,
                            desc: hl.description,
                            img: hl.image,
                            year: hl.location, // Mapping old location field to year space
                            parentEra: period.name
                        });
                    });
                }
            }
        });

        // Ensure chronological sort just in case
        return items;
    }, [expandedEraId]);

    const handleItemClick = (item: any) => {
        if (activeItem?.id === item.id) {
            // Collapse if clicking the already active item
            setActiveItem(null);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } }));
            }
            if (item.type === 'era') {
                setExpandedEraId(null);
            }
        } else {
            // Seamless synchronous active item update; concurrent transition
            setActiveItem(item);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: true } }));
            }
            if (item.type === 'era') {
                setExpandedEraId(item.id);
            }
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[var(--color-surface-warm)] relative overflow-hidden">
            {/* Instructions Header */}
            <div className={`px-6 md:px-12 pt-8 pb-4 shrink-0 bg-transparent z-10 transition-all duration-300 ${activeItem ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
                <h2 className="text-4xl md:text-5xl font-serif text-[var(--color-brand-primary)] mb-2 drop-shadow-sm font-black tracking-tight">Timeline</h2>
                <p className="text-[var(--color-text-muted)] text-base font-medium font-sans">Scroll horizontally or select a node to explore history.</p>
            </div>

            {/* The Scrollable Horizontal Timeline Section */}
            <div ref={scrollContainerRef} className="w-full overflow-x-auto timeline-scroll flex-1 bg-transparent flex items-center px-4 md:px-12 scroll-smooth">
                <div className="relative flex items-center h-full min-h-[500px] w-max gap-8 md:gap-12 lg:gap-16 pt-[100px] pb-[100px]">
                    {/* The literal horizontal line spanning all elements */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--color-brand-primary)] opacity-20 -translate-y-1/2 z-0" />

                    {timelineItems.map((item, index) => {
                        const isEra = item.type === 'era';
                        const isActive = activeItem?.id === item.id;
                        // Alternate event cards up and down when not active
                        const verticalPos = isEra ? 'bottom-16' : (index % 2 === 0 ? 'bottom-12' : 'top-12');

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { itemRefs.current[item.id] = el; }}
                                className={`relative flex items-center justify-center shrink-0 group transition-all duration-500 ease-in-out ${isActive ? 'w-[90vw] md:w-[800px] mx-8 z-50' : (isEra ? 'w-[200px]' : 'w-[160px]')}`}
                            >

                                {!isActive && (
                                    <>
                                        {isEra ? (
                                            <>
                                                {/* Distinct Era Node */}
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none shadow-lg z-10 hover:scale-125 bg-white border-[var(--color-brand-primary)]"
                                                    aria-label={`View era ${item.title}`}
                                                />
                                                <div className={`absolute ${verticalPos} w-48 text-center pointer-events-none group-hover:-translate-y-1 transition-transform`}>
                                                    <span className="block text-[10px] font-bold tracking-[0.2em] text-[var(--color-brand-secondary)] mb-1 uppercase opacity-80">{item.period}</span>
                                                    <h3 className="font-serif font-bold text-xl text-[var(--color-brand-primary)] leading-tight">{item.title}</h3>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Event Node Dot */}
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none hover:scale-[2] shadow-sm z-10 bg-[var(--color-brand-accent)] opacity-60 hover:opacity-100"
                                                    aria-label={`View details for ${item.title}`}
                                                />
                                                <button
                                                    className={`absolute ${verticalPos} w-40 bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 cursor-pointer overflow-hidden hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all text-left z-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-accent)]`}
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <div className="h-24 w-full overflow-hidden bg-gray-100/50">
                                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <div className="p-3 bg-gradient-to-b from-white/50 to-white/95">
                                                        <span className="text-[9px] font-bold text-[var(--color-brand-accent)] block mb-0.5 tracking-wider uppercase">{item.year}</span>
                                                        <h4 className="font-serif font-bold text-xs text-slate-800 leading-snug line-clamp-2">{item.title}</h4>
                                                    </div>
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Active State Expanded Inline Panel */}
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scaleX: 0.8 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        exit={{ opacity: 0, scaleX: 0.8 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full flex bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden relative z-50 h-[500px]"
                                    >
                                        <button onClick={() => { setActiveItem(null); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } })); }} className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>

                                        <div className="w-2/5 h-full relative shrink-0 overflow-hidden bg-slate-100">
                                            <img src={activeItem.img || 'https://images.unsplash.com/photo-1599839619721-397dd3ebf7f5?w=600&q=80'} alt={activeItem.title} className="w-full h-full object-cover absolute inset-0" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-8 left-8 text-white font-bold tracking-widest text-xl font-sans drop-shadow-md">
                                                {activeItem.type === 'era' ? activeItem.period : activeItem.year}
                                            </div>
                                            {activeItem.type === 'era' && (
                                                <div className="absolute top-8 left-8 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                                    Major Era
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-10 md:p-14 flex-1 flex flex-col justify-center overflow-y-auto">
                                            {activeItem.type === 'event' && (
                                                <span className="text-sm font-bold text-[var(--color-brand-accent)] uppercase tracking-[0.2em] mb-4 block opacity-80">{activeItem.parentEra}</span>
                                            )}
                                            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-800 mb-6 leading-tight tracking-tight">
                                                {activeItem.title}
                                            </h2>

                                            <div className="h-px w-full bg-slate-100 mb-6" />

                                            {activeItem.desc && (
                                                <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                                                    {activeItem.desc}
                                                </p>
                                            )}

                                            <div className="space-y-4 text-base text-slate-500 leading-relaxed font-sans mt-auto border-l-4 border-[var(--color-brand-primary)] pl-4">
                                                <p>
                                                    {activeItem.type === 'era'
                                                        ? `The ${activeItem.title} represents a fundamental epoch in the formation of Indian civilization. It defines an era marked by profound societal transformations.`
                                                        : `This event significantly influenced the trajectory of the ${activeItem.parentEra}.`
                                                    }
                                                </p>
                                                <p className="text-sm opacity-80">
                                                    Detailed findings from NCERT curriculum provide the backbone for our modern understanding.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        /* Custom scrollbar for timeline so it's obvious to mouse users */
        .timeline-scroll::-webkit-scrollbar { height: 8px; }
        .timeline-scroll::-webkit-scrollbar-track { background: var(--color-surface-warm); border-radius: 4px; }
        .timeline-scroll::-webkit-scrollbar-thumb { background: var(--color-brand-primary); border-radius: 4px; }
        .timeline-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-brand-secondary); }
      `}</style>
        </div>
    );
};

export default TimelinePage;

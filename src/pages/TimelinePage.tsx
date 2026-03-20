import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import timelineData from '../data/timeline.json';
import { getImageUrl, hasImage } from '../utils/imageUrl';
import { getTimelineFallbackImage } from '../utils/timelineFallbackImages';

interface TimelineItem {
    id: string;
    type: 'era' | 'event';
    title: string;
    desc?: string;
    yearVal?: string;
    period?: string;
    year?: string;
    img?: string;
    parentEra?: string;
}

const TimelinePage = () => {
    const [activeItem, setActiveItem] = useState<TimelineItem | null>(null);
    const [expandedEraId, setExpandedEraId] = useState<string | null>(null);
    const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const getEventImageUrl = useCallback((item: TimelineItem) => {
        const useLocal = hasImage(item.img) && !failedImageIds.has(item.id);
        return useLocal ? getImageUrl(item.img!) : getTimelineFallbackImage(item.title, item.desc);
    }, [failedImageIds]);

    const handleImageError = useCallback((itemId: string) => {
        setFailedImageIds(prev => new Set(prev).add(itemId));
    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeItem && itemRefs.current[activeItem.id] && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const el = itemRefs.current[activeItem.id];

            if (el) {
                const start = Date.now();
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
        const items: TimelineItem[] = [];
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

    const handleItemClick = (item: TimelineItem) => {
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
        <div className="w-full h-full flex flex-col bg-transparent relative overflow-hidden">
            {/* The Scrollable Horizontal Timeline Section — full height */}
            <div ref={scrollContainerRef} className="w-full overflow-x-auto timeline-scroll flex-1 bg-transparent flex items-center px-3 sm:px-4 md:px-12 scroll-smooth relative">

                {/* Title overlay — collapses when item is active */}
                <div className={`absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 md:px-12 transition-all duration-500 ease-in-out ${activeItem ? 'opacity-0 -translate-y-8 pointer-events-none h-0' : 'opacity-100 translate-y-0 pt-20 sm:pt-24 pb-4'}`}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white drop-shadow-lg mb-2">Timeline</h2>
                    <p className="text-white/80 text-sm sm:text-base font-medium font-sans">Scroll horizontally or tap a node to explore India's history.</p>
                </div>

                <div className="relative flex items-center h-full min-h-[400px] sm:min-h-[500px] w-max gap-4 sm:gap-8 md:gap-12 lg:gap-16 pt-20 sm:pt-[100px] pb-20 sm:pb-[100px]">
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
                                className={`relative flex items-center justify-center shrink-0 group transition-all duration-500 ease-in-out ${isActive ? 'w-[95vw] max-w-[90vw] sm:w-[90vw] md:w-[800px] mx-2 sm:mx-8 z-50' : (isEra ? 'w-[140px] sm:w-[200px]' : 'w-[120px] sm:w-[160px]')}`}
                            >

                                {!isActive && (
                                    <>
                                        {isEra ? (
                                            <>
                                                {/* Distinct Era Node */}
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 shadow-md z-10 hover:scale-110 bg-white/20 backdrop-blur-sm border-white ring-2 ring-white/50"
                                                    aria-label={`View era ${item.title}`}
                                                />
                                                <div className={`absolute ${verticalPos} w-48 text-center pointer-events-none group-hover:-translate-y-0.5 transition-transform`}>
                                                    <span className="block text-[10px] font-bold tracking-[0.2em] text-white/70 mb-1 uppercase opacity-90">{item.period}</span>
                                                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white leading-tight drop-shadow-md">{item.title}</h3>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Event Node Dot */}
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none hover:scale-[2] shadow-sm z-10 bg-white/80 opacity-60 hover:opacity-100"
                                                    aria-label={`View details for ${item.title}`}
                                                />
                                                <button
                                                    className={`absolute ${verticalPos} w-36 sm:w-40 bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 cursor-pointer overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-white/50 hover:bg-white/20 transition-all duration-300 text-left z-20 focus:outline-none focus:ring-2 focus:ring-white`}
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <div className="h-20 sm:h-24 w-full overflow-hidden bg-white/5">
                                                        <img src={getEventImageUrl(item)} alt={item.title} onError={() => handleImageError(item.id)} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90" />
                                                    </div>
                                                    <div className="p-2.5 sm:p-3 bg-gradient-to-b from-white/10 to-transparent">
                                                        <span className="text-[9px] font-bold text-white/70 block mb-0.5 tracking-wider uppercase">{item.year}</span>
                                                        <h4 className="font-serif font-bold text-xs text-white leading-snug line-clamp-2">{item.title}</h4>
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
                                        className="w-full flex flex-col sm:flex-row bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden relative z-50 min-h-[420px] max-h-[85vh] sm:h-[500px] sm:max-h-none"
                                    >
                                        <button onClick={() => { setActiveItem(null); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } })); }} className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors text-white">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>

                                        <div className="w-full sm:w-2/5 h-48 sm:h-full relative shrink-0 overflow-hidden bg-white/5">
                                            <img src={activeItem.type === 'event' ? getEventImageUrl(activeItem) : getTimelineFallbackImage(activeItem.title, activeItem.desc)} alt={activeItem.title} onError={(e) => { handleImageError(activeItem.id); (e.target as HTMLImageElement).src = getTimelineFallbackImage(activeItem.title, activeItem.desc); }} className="w-full h-full object-cover object-center absolute inset-0 opacity-90" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                            <div className="absolute bottom-8 left-8 text-white font-bold tracking-widest text-xl font-sans drop-shadow-lg">
                                                {activeItem.type === 'era' ? activeItem.period : activeItem.year}
                                            </div>
                                            {activeItem.type === 'era' && (
                                                <div className="absolute top-8 left-8 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                                    Major Era
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 sm:p-10 md:p-14 flex-1 flex flex-col justify-center overflow-y-auto min-h-0">
                                            {activeItem.type === 'event' && (
                                                <span className="text-sm font-bold text-white/70 uppercase tracking-[0.2em] mb-4 block">{activeItem.parentEra}</span>
                                            )}
                                            <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-6 leading-tight tracking-tight drop-shadow-md">
                                                {activeItem.title}
                                            </h2>

                                            <div className="h-px w-full bg-white/20 mb-6" />

                                            {activeItem.desc && (
                                                <p className="text-lg text-white/90 font-medium leading-relaxed mb-6">
                                                    {activeItem.desc}
                                                </p>
                                            )}

                                            <div className="space-y-4 text-base text-white/70 leading-relaxed font-sans mt-auto border-l-4 border-white/50 pl-4">
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

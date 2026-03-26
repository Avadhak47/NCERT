import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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
                <div className={`absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 md:px-12 transition-all duration-500 ease-in-out ${activeItem ? 'opacity-0 -translate-y-8 pointer-events-none h-0' : 'opacity-100 translate-y-0 pt-16 sm:pt-20 pb-4'}`}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-slate-900 drop-shadow-sm mb-2">Timeline</h2>
                    <p className="text-slate-700 text-sm sm:text-base font-medium font-sans">Scroll horizontally or tap a node to explore India's history.</p>
                </div>

                <div className="relative flex items-center h-full min-h-[400px] sm:min-h-[500px] w-max gap-4 sm:gap-8 md:gap-12 lg:gap-16 pt-16 sm:pt-24 pb-16 sm:pb-24">
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
                                                    className="w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 shadow-md z-10 hover:scale-110 bg-white border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/30"
                                                    aria-label={`View era ${item.title}`}
                                                />
                                                <div className={`absolute ${verticalPos} w-48 text-center pointer-events-none group-hover:-translate-y-0.5 transition-transform`}>
                                                    <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-500 mb-1 uppercase opacity-90">{item.period}</span>
                                                    <h3 className="font-serif font-black text-lg sm:text-xl text-black leading-tight drop-shadow-sm">{item.title}</h3>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Event Node Dot */}
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none hover:scale-[2] shadow-sm z-10 bg-[var(--color-brand-primary)] opacity-60 hover:opacity-100"
                                                    aria-label={`View details for ${item.title}`}
                                                />
                                                <button
                                                    className={`absolute ${verticalPos} w-36 sm:w-40 bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-md border border-white/50 cursor-pointer overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-white/80 hover:bg-white/60 transition-all duration-300 text-left z-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]`}
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <div className="h-20 sm:h-24 w-full overflow-hidden bg-slate-100">
                                                        <img src={getEventImageUrl(item)} alt={item.title} onError={() => handleImageError(item.id)} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90" />
                                                    </div>
                                                    <div className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm border-t border-white/20">
                                                        <span className="text-[9px] font-bold text-slate-700 block mb-0.5 tracking-wider uppercase">{item.year}</span>
                                                        <h4 className="font-serif font-black text-xs text-black leading-snug line-clamp-2">{item.title}</h4>
                                                    </div>
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Active State Expanded Inline Panel — Transformed into a premium modal-like card */}
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="w-full flex flex-col sm:flex-row bg-white/60 backdrop-blur-3xl rounded-3xl sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden relative z-50 min-h-[450px] max-h-[85vh] sm:h-[550px] mx-auto"
                                    >
                                        <button 
                                            onClick={() => { setActiveItem(null); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } })); }} 
                                            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/60 backdrop-blur-xl hover:bg-white border border-white/40 rounded-full flex items-center justify-center transition-all text-black shadow-lg hover:rotate-90 group"
                                        >
                                            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        </button>
 
                                        {/* Visual Section */}
                                        <div className="w-full sm:w-[45%] h-56 sm:h-full relative shrink-0 overflow-hidden">
                                            <motion.img 
                                                initial={{ scale: 1.1 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.8 }}
                                                src={activeItem.type === 'event' ? getEventImageUrl(activeItem) : getTimelineFallbackImage(activeItem.title, activeItem.desc)} 
                                                alt={activeItem.title} 
                                                onError={(e) => { handleImageError(activeItem.id); (e.target as HTMLImageElement).src = getTimelineFallbackImage(activeItem.title, activeItem.desc); }} 
                                                className="w-full h-full object-cover object-center absolute inset-0" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            <div className="absolute bottom-10 left-10">
                                                <span className="text-white/70 text-xs font-black tracking-[0.3em] uppercase mb-2 block">Chronicle</span>
                                                <div className="text-white font-serif font-black text-3xl sm:text-4xl drop-shadow-lg">
                                                    {activeItem.type === 'era' ? activeItem.period : activeItem.year}
                                                </div>
                                            </div>
                                            {activeItem.type === 'era' && (
                                                <div className="absolute top-10 left-10 px-5 py-2 bg-white/95 text-black border border-white/50 text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl">
                                                    Definitive Era
                                                </div>
                                            )}
                                        </div>
 
                                        {/* Content Section */}
                                        <div className="p-8 sm:p-12 md:p-16 flex-1 flex flex-col justify-center overflow-y-auto min-h-0 bg-transparent">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                {activeItem.type === 'event' && (
                                                    <span className="text-xs font-black text-[var(--color-brand-primary)] uppercase tracking-[0.3em] mb-4 block opacity-80">{activeItem.parentEra}</span>
                                                )}
                                                <h2 className="text-4xl md:text-6xl font-serif font-black text-black mb-8 leading-[1.1] tracking-tighter">
                                                    {activeItem.title}
                                                </h2>
 
                                                <div className="h-1.5 w-20 bg-[var(--color-brand-primary)] rounded-full mb-8 opacity-40" />
 
                                                {activeItem.desc && (
                                                    <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed mb-10 opacity-90 first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:mr-1 first-letter:float-left">
                                                        {activeItem.desc}
                                                    </p>
                                                )}
 
                                                <div className="pt-8 border-t border-slate-200/60 mt-auto">
                                                    <p className="text-sm text-slate-500 font-bold italic leading-relaxed">
                                                        {activeItem.type === 'era'
                                                            ? `Historical epochs like the ${activeItem.title} provided the foundational cultural architecture of the Indian subcontinent.`
                                                            : `This pivotal moment significantly shaped the heritage trajectory of the ${activeItem.parentEra}.`
                                                        }
                                                    </p>
                                                </div>
                                            </motion.div>
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

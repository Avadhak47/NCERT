import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
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
    color?: string;
}

const TimelinePage = () => {
    const [activeItem, setActiveItem] = useState<any>(null);
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
    const scrollContainerRefVertical = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activeItem || !itemRefs.current[activeItem.id]) return;

        const el = itemRefs.current[activeItem.id];
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

        if (isDesktop && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            let start = Date.now();
            const interval = setInterval(() => {
                if (Date.now() - start > 600) {
                    clearInterval(interval);
                    return;
                }
                if (!el) return;
                const padding = 64;
                const elRect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (elRect.left < containerRect.left + padding) {
                    container.scrollBy({ left: elRect.left - (containerRect.left + padding) });
                } else if (elRect.right > containerRect.right - padding) {
                    const nudge = elRect.right - (containerRect.right - padding);
                    if (elRect.left - nudge >= containerRect.left + padding) {
                        container.scrollBy({ left: nudge });
                    } else {
                        container.scrollBy({ left: elRect.left - (containerRect.left + padding) });
                    }
                }
            }, 16);
            return () => clearInterval(interval);
        }

        if (!isDesktop && scrollContainerRefVertical.current && el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activeItem]);

    // Dynamic array that injects events only for the active era (include period color)
    const timelineItems = useMemo(() => {
        const items: TimelineItem[] = [];
        timelineData.periods.forEach((period: { id: string; name: string; years: string; color?: string; description?: string; highlights?: { name: string; description?: string; image?: string; location?: string }[] }) => {
            const periodColor = period.color || '#0284c7';
            items.push({
                id: period.id,
                type: 'era',
                yearVal: period.years,
                period: period.years,
                title: period.name,
                desc: period.description,
                color: periodColor
            });
            if (expandedEraId === period.id && period.highlights) {
                period.highlights.forEach((hl, i) => {
                    items.push({
                        id: `${period.id}-hl-${i}`,
                        type: 'event',
                        title: hl.name,
                        desc: hl.description,
                        img: hl.image,
                        year: hl.location,
                        parentEra: period.name,
                        color: periodColor
                    });
                });
            }
        });
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
        <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-50 via-[var(--color-surface-warm)] to-amber-50/30 relative overflow-hidden">
            {/* Header */}
            <div className={`px-4 sm:px-6 md:px-10 pt-4 pb-3 shrink-0 z-10 transition-all duration-300 ${activeItem ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20">
                        <Clock className="w-6 h-6 text-[var(--color-brand-primary)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-800 tracking-tight">Timeline</h2>
                        <p className="text-[var(--color-text-muted)] text-sm font-medium">Scroll or tap a node to explore India&apos;s history</p>
                    </div>
                </div>
            </div>

            {/* Vertical Timeline (mobile only) */}
            <div ref={scrollContainerRefVertical} className="md:hidden flex-1 overflow-y-auto min-h-0 px-4 pb-8">
                <div className="relative py-6">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-slate-300 to-transparent z-0" />
                    {timelineItems.map((item) => {
                        const isEra = item.type === 'era';
                        const isActive = activeItem?.id === item.id;
                        return (
                            <div
                                key={item.id}
                                ref={(el) => { itemRefs.current[item.id] = el; }}
                                className={`relative pl-12 pr-2 py-4 ${isActive ? 'min-h-[380px]' : ''}`}
                            >
                                <div className="absolute left-5 top-8 -translate-x-1/2 z-10">
                                    {isEra ? (
                                        <button
                                            onClick={() => handleItemClick(item)}
                                            className="w-8 h-8 rounded-full border-[3px] bg-white shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                                            style={{ borderColor: item.color || 'var(--color-brand-primary)' }}
                                            aria-label={`View era ${item.title}`}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => handleItemClick(item)}
                                            className="w-3.5 h-3.5 rounded-full shadow transition-transform hover:scale-125 focus:outline-none"
                                            style={{ backgroundColor: item.color || 'var(--color-brand-accent)' }}
                                            aria-label={`View ${item.title}`}
                                        />
                                    )}
                                </div>
                                {!isActive && (
                                    <>
                                        {isEra ? (
                                            <button onClick={() => handleItemClick(item)} className="w-full text-left block">
                                                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block mb-1">{item.period}</span>
                                                <h3 className="font-serif font-bold text-base leading-tight" style={{ color: item.color || 'var(--color-brand-primary)' }}>{item.title}</h3>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleItemClick(item)}
                                                className="w-full bg-white rounded-xl shadow border border-slate-200 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                            >
                                                <div className="h-24 w-full overflow-hidden bg-slate-100 relative">
                                                    <img src={getEventImageUrl(item)} alt="" onError={() => handleImageError(item.id)} className="w-full h-full object-cover" />
                                                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: item.color }} />
                                                </div>
                                                <div className="p-3">
                                                    <span className="text-[9px] font-bold tracking-wider uppercase block mb-0.5" style={{ color: item.color }}>{item.year}</span>
                                                    <h4 className="font-serif font-bold text-sm text-slate-800 line-clamp-2">{item.title}</h4>
                                                </div>
                                            </button>
                                        )}
                                    </>
                                )}
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                                    >
                                        <div className="relative h-44 overflow-hidden bg-slate-100">
                                            <img src={activeItem.type === 'event' ? getEventImageUrl(activeItem) : getTimelineFallbackImage(activeItem.title, activeItem.desc)} alt="" onError={(e) => { handleImageError(activeItem.id); (e.target as HTMLImageElement).src = getTimelineFallbackImage(activeItem.title, activeItem.desc); }} className="w-full h-full object-cover" />
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: activeItem.color }} />
                                            <div className="absolute bottom-3 left-3 text-white/90 text-sm font-semibold drop-shadow-md">{activeItem.type === 'era' ? activeItem.period : activeItem.year}</div>
                                            <button onClick={() => { setActiveItem(null); window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } })); }} className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center text-slate-600" aria-label="Close">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            {activeItem.type === 'event' && activeItem.parentEra && <span className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: activeItem.color }}>{activeItem.parentEra}</span>}
                                            <h2 className="font-serif font-bold text-xl text-slate-800 mb-2">{activeItem.title}</h2>
                                            {activeItem.desc && <p className="text-sm text-slate-600 leading-relaxed mb-3">{activeItem.desc}</p>}
                                            <p className="text-xs text-slate-500 border-l-2 pl-3" style={{ borderColor: activeItem.color }}>{activeItem.type === 'era' ? `The ${activeItem.title} period.` : `Part of ${activeItem.parentEra}.`}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Horizontal Timeline (laptop/desktop) */}
            <div ref={scrollContainerRef} className="hidden md:flex w-full overflow-x-auto timeline-scroll flex-1 items-center px-4 md:px-10 scroll-smooth">
                <div className="relative flex items-center h-full min-h-[480px] w-max gap-10 md:gap-14 lg:gap-20 py-16">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent -translate-y-1/2 z-0" />

                    {timelineItems.map((item, index) => {
                        const isEra = item.type === 'era';
                        const isActive = activeItem?.id === item.id;
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
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-8 h-8 rounded-full border-[3px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg z-10 hover:scale-110 bg-white ring-2 ring-white"
                                                    style={{ borderColor: item.color || 'var(--color-brand-primary)' }}
                                                    aria-label={`View era ${item.title}`}
                                                />
                                                <div className={`absolute ${verticalPos} w-44 sm:w-52 text-center pointer-events-none group-hover:-translate-y-0.5 transition-transform`}>
                                                    <span className="block text-[10px] font-bold tracking-widest text-slate-500 mb-1.5 uppercase">{item.period}</span>
                                                    <h3 className="font-serif font-bold text-base sm:text-lg leading-tight" style={{ color: item.color || 'var(--color-brand-primary)' }}>{item.title}</h3>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className="w-3 h-3 rounded-full transition-all duration-300 focus:outline-none hover:scale-150 z-10 shadow-md opacity-70 hover:opacity-100"
                                                    style={{ backgroundColor: item.color || 'var(--color-brand-accent)' }}
                                                    aria-label={`View ${item.title}`}
                                                />
                                                <button
                                                    className={`absolute ${verticalPos} w-36 sm:w-44 bg-white rounded-2xl shadow-md border border-slate-200/90 cursor-pointer overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300 text-left z-20 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2`}
                                                    onClick={() => handleItemClick(item)}
                                                >
                                                    <div className="h-20 sm:h-28 w-full overflow-hidden bg-slate-100 relative">
                                                        <img src={getEventImageUrl(item)} alt="" onError={() => handleImageError(item.id)} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: item.color }} />
                                                    </div>
                                                    <div className="p-3 bg-white">
                                                        <span className="text-[9px] font-bold tracking-wider uppercase block mb-1" style={{ color: item.color }}>{item.year}</span>
                                                        <h4 className="font-serif font-bold text-sm text-slate-800 leading-snug line-clamp-2">{item.title}</h4>
                                                    </div>
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Active expanded panel */}
                                {isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="w-full flex bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-50 h-[400px] sm:h-[480px]"
                                    >
                                        <div className="absolute top-4 right-4 z-50">
                                            <button
                                                onClick={() => { setActiveItem(null); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } })); }}
                                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                                                aria-label="Close"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>

                                        <div className="w-2/5 min-w-[200px] h-full relative shrink-0 overflow-hidden bg-slate-100">
                                            <img src={activeItem.type === 'event' ? getEventImageUrl(activeItem) : getTimelineFallbackImage(activeItem.title, activeItem.desc)} alt="" onError={(e) => { handleImageError(activeItem.id); (e.target as HTMLImageElement).src = getTimelineFallbackImage(activeItem.title, activeItem.desc); }} className="w-full h-full object-cover object-center absolute inset-0" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: activeItem.color }} />
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <span className="text-white/90 text-sm font-semibold tracking-wider drop-shadow-md">
                                                    {activeItem.type === 'era' ? activeItem.period : activeItem.year}
                                                </span>
                                            </div>
                                            {activeItem.type === 'era' && (
                                                <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wider shadow">
                                                    Era
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center overflow-y-auto min-w-0">
                                            {activeItem.type === 'event' && activeItem.parentEra && (
                                                <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: activeItem.color }}>{activeItem.parentEra}</span>
                                            )}
                                            <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-800 mb-4 leading-tight">
                                                {activeItem.title}
                                            </h2>

                                            {activeItem.desc && (
                                                <p className="text-slate-600 leading-relaxed mb-6">
                                                    {activeItem.desc}
                                                </p>
                                            )}

                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                <p className="text-sm text-slate-500 leading-relaxed border-l-2 pl-4" style={{ borderColor: activeItem.color || 'var(--color-brand-primary)' }}>
                                                    {activeItem.type === 'era'
                                                        ? `The ${activeItem.title} period marks a fundamental epoch in the formation of Indian civilization.`
                                                        : `Part of the ${activeItem.parentEra} — NCERT curriculum.`
                                                    }
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

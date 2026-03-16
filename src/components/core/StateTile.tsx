import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { X, Image as ImageIcon, BookOpen, MapPin, Landmark, Video, Globe, Users, Info, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import statesData from '../../data/states.json';
import { getImageUrl, hasImage } from '../../utils/imageUrl';
import { getFallbackImage } from '../../utils/fallbackImages';

interface StateTileProps {
    stateId: string;
    stateName: string;
    onClose: () => void;
    activeMonumentId?: string | null;
}

interface GalleryItem {
    id?: string;
    name: string;
    desc: string;
    img?: string;
    type: string;
    materials?: string;
    historical_significance?: string;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
}

const getCompactName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.split('-');
    return parts[parts.length - 1].trim();
};

const StateTile: React.FC<StateTileProps> = ({ stateName, onClose, activeMonumentId }) => {
    const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
    const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
    const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

    // Removed old handleImageError since it was redeclared further down

    // Look up the specific state from JSON
    const stateRecord = useMemo(() => {
        return statesData.states.find(s => s.name === stateName);
    }, [stateName]);

    const galleryItems = useMemo<GalleryItem[]>(() => {
        if (!stateRecord) return [];
        const items: GalleryItem[] = [];

        // Add Monuments
        if (stateRecord.monuments) {
            stateRecord.monuments.forEach((m: Record<string, unknown>) => items.push({
                ...m,
                name: m.name as string,
                desc: m.desc as string,
                type: 'Monument',
                icon: Landmark,
                colorClass: 'text-amber-300',
                bgClass: 'from-amber-400/20 to-orange-600/20 border-amber-400/30'
            }));
        }

        // Add Paintings
        if (stateRecord.art_forms?.paintings) {
            stateRecord.art_forms.paintings.forEach((p: Record<string, unknown>) => items.push({
                ...p,
                desc: p.desc as string,
                name: (p.title || p.name) as string,
                type: 'Visual Art',
                icon: ImageIcon,
                colorClass: 'text-pink-300',
                bgClass: 'from-pink-400/20 to-rose-600/20 border-pink-400/30'
            }));
        }

        // Add Handicrafts
        if (stateRecord.art_forms?.handicrafts) {
            stateRecord.art_forms.handicrafts.forEach((h: Record<string, unknown>) => items.push({
                ...h,
                name: h.name as string,
                desc: h.desc as string,
                type: 'Handicraft',
                icon: ImageIcon,
                colorClass: 'text-orange-300',
                bgClass: 'from-orange-400/20 to-red-500/20 border-orange-400/30'
            }));
        }

        // Add Performing Arts
        if (stateRecord.art_forms?.performing_arts) {
            stateRecord.art_forms.performing_arts.forEach((pa: Record<string, unknown>) => items.push({
                ...pa,
                desc: pa.desc as string,
                name: (pa.title || pa.name) as string,
                type: 'Performing Art',
                icon: Video,
                colorClass: 'text-purple-300',
                bgClass: 'from-purple-400/20 to-fuchsia-600/20 border-purple-400/30'
            }));
        }

        return items;
    }, [stateRecord]);

    // Auto-scroll to active monument
    useEffect(() => {
        if (activeMonumentId) {
            setTimeout(() => {
                setExpandedArticleId(activeMonumentId);
            }, 0);
            // Find the element and scroll it into view after a short delay to ensure rendering
            setTimeout(() => {
                const el = document.getElementById(`article-${activeMonumentId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300); // slightly longer delay to allow expansion animation
        }
    }, [activeMonumentId]);

    const handleImageError = useCallback((failedUrl: string, fallbackUrl: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        // Prevent infinite loop if the fallback itself fails
        if (failedUrl === fallbackUrl || failedImageUrls.has(fallbackUrl)) {
            return; // Give up trying to load images for this element if fallback fails
        }

        setFailedImageUrls(prev => new Set(prev).add(failedUrl));
        (e.target as HTMLImageElement).src = fallbackUrl;
    }, [failedImageUrls]);

    // ...

    const renderImage = (item: GalleryItem, className: string) => {
        const primaryUrl = getImageUrl(item.img!);
        const fallbackUrl = getFallbackImage(item.name, item.type.toLowerCase());

        // If primary URL has failed previously, use fallback directly
        const urlToUse = hasImage(item.img) && !failedImageUrls.has(primaryUrl)
            ? primaryUrl
            : fallbackUrl;

        // If fallback has also failed previously, maybe render a solid color block instead
        if (failedImageUrls.has(fallbackUrl)) {
            return <div className={`${className} bg-slate-800 flex items-center justify-center text-white/20`}><ImageIcon className="w-12 h-12" /></div>;
        }

        return (
            <img
                src={urlToUse}
                alt={item.name}
                onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc || urlToUse, fallbackUrl, e)}
                className={className}
            />
        );
    };

    return (
        <div className="w-full h-full flex flex-col z-50 text-white overflow-hidden relative">

            {/* Header / Action Bar */}
            <div className="w-full px-6 py-4 flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border-b border-white/10 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xl md:text-2xl font-serif font-black text-white">{stateName}</span>
                    {stateRecord?.geography?.capital && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{stateRecord.geography.capital}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/20 hover:scale-105 active:scale-95 text-white hover:text-red-400 group"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                {/* Scannable Hero Card */}
                <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative group">
                    <div className="absolute -right-20 -top-20 opacity-30 w-64 h-64 bg-white/20 rounded-full blur-3xl z-0 pointer-events-none" />

                    <div className="p-6 md:p-8 relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        {/* 3D Model Placeholder Container */}
                        <div className="w-28 h-28 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center relative shrink-0 overflow-hidden shadow-inner">
                            <div className="w-16 h-16 relative perspective-1000">
                                <div className="w-full h-full absolute preserve-3d animate-[spinCube_8s_linear_infinite]">
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "translateZ(32px)" }}></div>
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 -translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "rotateY(180deg) translateZ(32px)" }}></div>
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 rotate-y-90 translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "rotateY(90deg) translateZ(32px)" }}></div>
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 -rotate-y-90 translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "rotateY(-90deg) translateZ(32px)" }}></div>
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 rotate-x-90 translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "rotateX(90deg) translateZ(32px)" }}></div>
                                    <div className="absolute w-full h-full border border-white/30 bg-indigo-500/20 -rotate-x-90 translate-z-8 flex items-center justify-center font-bold text-white/50 text-[8px] backdrop-blur-sm rounded-lg" style={{ transform: "rotateX(-90deg) translateZ(32px)" }}></div>
                                </div>
                            </div>
                            <span className="absolute bottom-2 text-[8px] font-bold text-white/50 tracking-widest uppercase">3D Tour</span>
                        </div>

                        {/* Title and Quick Facts */}
                        <div className="flex-1 flex flex-col justify-center w-full text-center sm:text-left">
                            <h1 className="text-3xl md:text-5xl font-serif font-black text-white drop-shadow-lg leading-tight mb-3">
                                {stateName}
                            </h1>
                            <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed mb-4 line-clamp-2 md:line-clamp-none">
                                {stateRecord?.facts?.[0] || `Explore the incredible heritage and culture of ${stateName}.`}
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                {stateRecord?.geography?.key_cities?.length ? (
                                    <span className="flex items-center gap-1.5 bg-black/40 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md shadow-inner">
                                        <Globe className="w-3.5 h-3.5 text-green-400" /> Cities: <span className="text-white ml-0.5">{stateRecord.geography.key_cities.length}</span>
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Info Badges (Museums, Fairs) - Inline Row */}
                <div className="grid grid-cols-2 gap-4">
                    {stateRecord?.fairs_and_festivals && stateRecord.fairs_and_festivals.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <div className="text-white/40 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform"><Users className="w-20 h-20 opacity-20" /></div>
                            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Fairs & Festivals</h3>
                            <p className="text-xs text-white/60 font-medium z-10">{stateRecord.fairs_and_festivals.length} Major events including {stateRecord.fairs_and_festivals[0].name}</p>
                        </div>
                    )}
                    {stateRecord?.museums && stateRecord.museums.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <div className="text-white/40 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform"><BookOpen className="w-20 h-20 opacity-20" /></div>
                            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-4 h-4 text-stone-400" /> Museums</h3>
                            <p className="text-xs text-white/60 font-medium z-10">{stateRecord.museums.length} Historical archives & repositories</p>
                        </div>
                    )}
                </div>

                {/* Unified Heritage Gallery */}
                {galleryItems.length > 0 && (
                    <div className="pt-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-serif font-black text-white flex items-center justify-center gap-3">
                                <SparklesIcon /> Visual Heritage Gallery
                            </h2>
                            <span className="text-xs font-bold text-white/50 bg-white/5 px-2 py-1 rounded-md">{galleryItems.length} Items</span>
                        </div>

                        <div className="flex flex-col gap-12 sm:gap-16 mt-8">
                            {galleryItems.map((item, idx) => {
                                const Icon = item.icon;
                                const isHighlighted = activeMonumentId && activeMonumentId === item.id;
                                const isExpanded = expandedArticleId === (item.id || String(idx));
                                const compactName = getCompactName(item.name);
                                return (
                                    <article
                                        key={item.id || idx}
                                        id={item.id ? `article-${item.id}` : undefined}
                                        onClick={() => setExpandedArticleId(isExpanded ? null : (item.id || String(idx)))}
                                        className={`flex flex-col bg-black/40 border ${isHighlighted ? 'border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.2)] ring-1 ring-amber-400' : 'border-white/10'} rounded-[2rem] overflow-hidden group hover:border-white/30 hover:bg-white/5 transition-all w-full cursor-pointer`}
                                    >
                                        <div className={`${isExpanded ? 'h-64 sm:h-80 md:h-96' : 'h-48 sm:h-56'} overflow-hidden relative bg-black/60 w-full shrink-0 transition-all duration-500`}>
                                            {renderImage(item, "w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100")}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                                            {/* Type Badge */}
                                            <div className={`absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase border flex items-center gap-2 backdrop-blur-md bg-gradient-to-br ${item.bgClass} ${item.colorClass} shadow-lg`}>
                                                <Icon className="w-4 h-4" /> {item.type}
                                            </div>
                                            {/* Expand Icon */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setLightboxItem(item); }}
                                                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/50 backdrop-blur-xl p-2.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 hover:bg-white/20 hover:scale-110 shadow-xl z-20"
                                                aria-label="View Fullscreen"
                                            >
                                                <Maximize2 className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                        <div className="p-6 sm:p-8 md:p-10 relative z-10 border-t border-white/10 flex flex-col flex-1 bg-gradient-to-b from-white/5 to-transparent">
                                            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight mb-4">{compactName}</h3>
                                            <p className={`text-sm sm:text-base text-slate-300 font-medium leading-relaxed transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>{item.desc}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* FULLSCREEN IMAGE LIGHTBOX OVERLAY */}
            <AnimatePresence>
                {lightboxItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col"
                    >
                        {/* Lightbox Header */}
                        <div className="w-full flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border bg-gradient-to-br ${lightboxItem.bgClass} ${lightboxItem.colorClass}`}>
                                    <lightboxItem.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif font-black text-white">{getCompactName(lightboxItem.name)}</h3>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/10 px-2 py-1 rounded-md border border-white/10">
                                        <lightboxItem.icon className="w-3 h-3" /> {lightboxItem.type}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setLightboxItem(null)}
                                className="bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/20 transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Lightbox Content Layout */}
                        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Image Container */}
                            <div className="flex-1 h-1/2 md:h-full flex items-center justify-center p-4 md:p-8 relative">
                                {renderImage(lightboxItem, "max-w-full max-h-full object-contain rounded-xl shadow-2xl ring-1 ring-white/20")}
                            </div>

                            {/* Detailed Info Sidebar */}
                            <div className="w-full md:w-[400px] h-1/2 md:h-full bg-black/40 border-l border-white/10 p-6 md:p-8 overflow-y-auto custom-scrollbar shrink-0">
                                <h4 className="text-2xl font-serif font-bold text-white mb-4 leading-tight">{getCompactName(lightboxItem.name)}</h4>
                                <p className="text-white/80 leading-relaxed text-sm mb-8">{lightboxItem.desc}</p>

                                {lightboxItem.materials && (
                                    <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                                            <Info className="w-3.5 h-3.5" /> Materials
                                        </span>
                                        <p className="text-sm font-medium text-white/90">{lightboxItem.materials}</p>
                                    </div>
                                )}

                                {lightboxItem.historical_significance && (
                                    <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                                            <BookOpen className="w-3.5 h-3.5" /> Historical Context
                                        </span>
                                        <p className="text-sm font-medium text-white/90 italic">"{lightboxItem.historical_significance}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
               .perspective-1000 { perspective: 1000px; }
               .preserve-3d { transform-style: preserve-3d; }
               @keyframes spinCube {
                   0% { transform: rotateX(0deg) rotateY(0deg); }
                   100% { transform: rotateX(360deg) rotateY(360deg); }
               }
               /* Custom Scrollbar */
               .custom-scrollbar::-webkit-scrollbar { width: 4px; }
               .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
               .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
               .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
            `}</style>
        </div>
    );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
)

export default StateTile;

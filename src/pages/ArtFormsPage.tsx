import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Image as ImageIcon, Search, Palette, Music, Hand, Landmark, PartyPopper } from 'lucide-react';
import statesData from '../data/states.json';
import { getImageUrl, hasImage } from '../utils/imageUrl';
import { getFallbackImage } from '../utils/fallbackImages';

interface ArtFormItem {
    id: string;
    title?: string;
    name?: string;
    desc?: string;
    img?: string;
    state: string;
    type: string;
    height: number;
    historical_significance?: string;
    materials?: string;
}

function artTypeToFallbackType(t: string): string {
    if (t === 'Handicrafts') return 'handicraft';
    if (t === 'Performing Arts') return 'performing arts';
    return t;
}

const TAB_CONFIG: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'All', label: 'All', icon: ImageIcon },
    { id: 'Painting', label: 'Painting', icon: Palette },
    { id: 'Performing Arts', label: 'Performing Arts', icon: Music },
    { id: 'Handicrafts', label: 'Handicrafts', icon: Hand },
    { id: 'Monuments', label: 'Monuments', icon: Landmark },
    { id: 'Festivals', label: 'Festivals', icon: PartyPopper },
];

const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.03 * i },
    }),
};

const cardItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

const ArtFormsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

    const handleImageError = useCallback((failedUrl: string, fallbackUrl: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        setFailedImageUrls(prev => new Set(prev).add(failedUrl));
        (e.target as HTMLImageElement).src = fallbackUrl;
    }, []);

    const allArtForms = useMemo(() => {
        const compiled: ArtFormItem[] = [];
        const heights = [280, 340, 300, 360, 320, 290, 350, 310];
        let hIdx = 0;

        statesData.states.forEach((state: { name: string; art_forms?: { paintings?: any[]; performing_arts?: any[]; handicrafts?: any[] }; monuments?: any[]; fairs_and_festivals?: any[] }) => {
            if (state.art_forms) {
                state.art_forms.paintings?.forEach((p: any) => {
                    compiled.push({ ...p, id: `p-${p.id}`, state: state.name, type: 'Painting', height: heights[hIdx++ % heights.length] });
                });
                state.art_forms.performing_arts?.forEach((p: any) => {
                    compiled.push({ ...p, id: `pa-${p.id}`, state: state.name, type: 'Performing Arts', height: heights[hIdx++ % heights.length] });
                });
                state.art_forms.handicrafts?.forEach((p: any) => {
                    compiled.push({ ...p, id: `hc-${p.id}`, state: state.name, type: 'Handicrafts', height: heights[hIdx++ % heights.length] });
                });
            }
            state.monuments?.forEach((m: any) => {
                if (m.img) compiled.push({ ...m, id: `m-${m.id}`, title: m.name, state: state.name, type: 'Monument', height: heights[hIdx++ % heights.length] });
            });
            state.fairs_and_festivals?.forEach((f: any) => {
                if (f.img) compiled.push({ ...f, id: `f-${f.id}`, title: f.name, state: state.name, type: 'Festival', height: heights[hIdx++ % heights.length] });
            });
        });
        return compiled.sort(() => 0.5 - Math.random());
    }, []);

    const filteredArts = useMemo(() => {
        let list = activeTab === 'All'
            ? allArtForms
            : allArtForms.filter(art => {
                if (activeTab === 'Monuments' && art.type === 'Monument') return true;
                if (activeTab === 'Festivals' && art.type === 'Festival') return true;
                return art.type === activeTab;
            });
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter(art => {
                const title = (art.title ?? art.name ?? '').toLowerCase();
                const state = (art.state ?? '').toLowerCase();
                const desc = (art.desc ?? '').toLowerCase();
                return title.includes(q) || state.includes(q) || desc.includes(q);
            });
        }
        return list;
    }, [activeTab, allArtForms, searchQuery]);

    const [selectedArt, setSelectedArt] = useState<ArtFormItem | null>(null);

    if (typeof document !== 'undefined') {
        document.body.style.overflow = selectedArt ? 'hidden' : '';
    }

    const displayName = (art: ArtFormItem) => art.title ?? art.name ?? 'Untitled';

    return (
        <div className="w-full h-full overflow-y-auto min-h-0 relative">
            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-slate-50 via-[var(--color-surface-warm)] via-40% to-amber-50/40 z-0" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(2,132,199,0.07),transparent)] z-0" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_60%_at_85%_90%,rgba(234,88,12,0.05),transparent)] z-0" />

            <div className="relative z-10 px-4 sm:px-6 md:px-12 pt-5 pb-20">
                {/* Header: title left, search right */}
                <motion.header
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.08, type: 'spring', stiffness: 200 }}
                            className="shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-sky-600 text-white shadow-lg shadow-sky-500/25 ring-2 ring-white/50"
                        >
                            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
                        </motion.div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-tight truncate">
                                Cultural Gallery
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">
                                Dances, crafts, monuments & festivals from across India
                            </p>
                        </div>
                    </div>

                    <div className="relative shrink-0 w-40 sm:w-52 md:w-64 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search…"
                            className="w-full pl-9 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200/90 bg-white/95 text-slate-800 placeholder-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40 focus:border-[var(--color-brand-primary)] focus:shadow-[0_0_0_3px_rgba(2,132,199,0.1)] transition-all"
                            aria-label="Search art forms"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </motion.header>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10"
                >
                    {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 ${
                                activeTab === id
                                    ? 'bg-gradient-to-r from-[var(--color-brand-primary)] to-sky-600 text-white shadow-lg shadow-sky-500/25 scale-[1.02]'
                                    : 'bg-white/90 text-slate-600 hover:text-slate-800 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {label}
                        </button>
                    ))}
                </motion.div>

                {/* Grid */}
                {filteredArts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-lg font-serif font-bold text-slate-700 mb-2">No results</h2>
                        <p className="text-slate-500 text-sm max-w-xs mb-6">
                            Try another category or clear your search to see all items.
                        </p>
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Show all
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 sm:gap-6 space-y-5 sm:space-y-6"
                        variants={container}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredArts.map((art) => (
                                <motion.button
                                    key={art.id}
                                    layout
                                    variants={cardItem}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setSelectedArt(art)}
                                    className="w-full break-inside-avoid relative group rounded-2xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-8px_rgba(2,132,199,0.25)] border border-slate-100/90 hover:border-[var(--color-brand-primary)]/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40 focus:ring-offset-2 text-left hover:-translate-y-1"
                                    aria-label={`View ${displayName(art)} — ${art.state}`}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-brand-primary)] to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-l-2xl" aria-hidden />
                                    <div style={{ height: art.height }} className="w-full overflow-hidden bg-slate-200 relative">
                                        <img
                                            src={hasImage(art.img) && !failedImageUrls.has(getImageUrl(art.img!)) ? getImageUrl(art.img!) : getFallbackImage(displayName(art), artTypeToFallbackType(art.type))}
                                            alt=""
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(displayName(art), artTypeToFallbackType(art.type)), e)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-70 sm:opacity-0 sm:group-hover:opacity-80 transition-opacity duration-400" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 transform translate-y-2 sm:translate-y-3 sm:group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur text-[var(--color-brand-primary)] text-[10px] font-bold tracking-widest rounded-full mb-2 uppercase">
                                            {art.type}
                                        </span>
                                        <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight drop-shadow-md line-clamp-2">{displayName(art)}</h3>
                                        <p className="text-white/90 text-xs font-medium flex items-center gap-1.5 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                            {art.state}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selectedArt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/55 backdrop-blur-sm"
                        onClick={() => setSelectedArt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                            className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl ring-1 ring-black/10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-2/5 min-h-[220px] md:min-h-0 md:h-auto overflow-hidden relative bg-slate-100">
                                <img
                                    src={hasImage(selectedArt.img) && !failedImageUrls.has(getImageUrl(selectedArt.img!)) ? getImageUrl(selectedArt.img!) : getFallbackImage(displayName(selectedArt), artTypeToFallbackType(selectedArt.type))}
                                    alt=""
                                    className="w-full h-full min-h-[220px] object-cover object-center"
                                    onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(displayName(selectedArt), artTypeToFallbackType(selectedArt.type)), e)}
                                />
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-brand-primary)] to-sky-500 rounded-l-3xl" aria-hidden />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur text-[var(--color-brand-primary)] text-xs font-bold tracking-widest uppercase rounded-xl shadow">
                                        {selectedArt.type}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0 p-6 sm:p-8 md:p-10 overflow-y-auto bg-gradient-to-b from-[var(--color-surface-warm)]/50 to-white">
                                <button
                                    onClick={() => setSelectedArt(null)}
                                    className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors z-10"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2 text-[var(--color-brand-accent)] font-semibold text-sm mb-3">
                                    <MapPin className="w-4 h-4" />
                                    {selectedArt.state}
                                </div>

                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4 pr-12 leading-tight">
                                    {displayName(selectedArt)}
                                </h2>

                                {selectedArt.desc && (
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {selectedArt.desc}
                                    </p>
                                )}

                                <div className="space-y-4 mt-auto">
                                    <div className="p-5 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
                                        <h4 className="text-[var(--color-brand-secondary)] font-bold text-sm uppercase tracking-wider mb-2">Historical significance</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {selectedArt.historical_significance || "This art form has been passed down through generations, adhering to ancient principles while evolving over time. It forms a core part of India's intangible cultural heritage."}
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
                                        <h4 className="text-[var(--color-brand-purple)] font-bold text-sm uppercase tracking-wider mb-2">Materials & process</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {selectedArt.materials || "Natural dyes, locally sourced materials, and manual processes characterise this tradition. The skill often requires years of practice under the guidance of master artisans."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArtFormsPage;

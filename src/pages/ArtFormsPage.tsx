import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
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

const ArtFormsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

    const handleImageError = useCallback((failedUrl: string, fallbackUrl: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        setFailedImageUrls(prev => new Set(prev).add(failedUrl));
        (e.target as HTMLImageElement).src = fallbackUrl;
    }, []);

    // Flatten all art forms from states.json into a single array
    const allArtForms = useMemo(() => {
        let compiled: any[] = [];
        const heights = [300, 400, 250, 380, 320, 280, 350, 310]; // staggered masonry looks
        let hIdx = 0;

        statesData.states.forEach(state => {
            if (state.art_forms) {
                // Paintings
                state.art_forms.paintings?.forEach(p => {
                    compiled.push({ ...p, id: `p-${p.id}`, state: state.name, type: 'Painting', height: heights[hIdx++ % heights.length] });
                });
                // Performing Arts
                state.art_forms.performing_arts?.forEach(p => {
                    compiled.push({ ...p, id: `pa-${p.id}`, state: state.name, type: 'Performing Arts', height: heights[hIdx++ % heights.length] });
                });
                // Handicrafts
                state.art_forms.handicrafts?.forEach(p => {
                    compiled.push({ ...p, id: `hc-${p.id}`, state: state.name, type: 'Handicrafts', height: heights[hIdx++ % heights.length] });
                });
            }
            if (state.monuments) {
                state.monuments.forEach(m => {
                    // Make sure it has an image to look good
                    if (m.img) {
                        compiled.push({ ...m, id: `m-${m.id}`, title: m.name, state: state.name, type: 'Monument', height: heights[hIdx++ % heights.length] });
                    }
                })
            }
            if (state.fairs_and_festivals) {
                state.fairs_and_festivals.forEach(f => {
                    if (f.img) {
                        compiled.push({ ...f, id: `f-${f.id}`, title: f.name, state: state.name, type: 'Festival', height: heights[hIdx++ % heights.length] });
                    }
                })
            }
        });

        // shuffle lightly or sort
        return compiled.sort(() => 0.5 - Math.random());
    }, []);

    const filteredArts = useMemo(() => {
        if (activeTab === 'All') return allArtForms;
        return allArtForms.filter(art => {
            if (activeTab === 'Monuments' && art.type === 'Monument') return true;
            if (activeTab === 'Festivals' && art.type === 'Festival') return true;
            return art.type === activeTab;
        });
    }, [activeTab, allArtForms]);

    const tabs = ['All', 'Painting', 'Performing Arts', 'Handicrafts', 'Monuments', 'Festivals'];

    const [selectedArt, setSelectedArt] = useState<ArtFormItem | null>(null);

    // Stop scrolling on body when modal is open
    if (typeof document !== 'undefined') {
        document.body.style.overflow = selectedArt ? 'hidden' : 'auto';
    }

    return (
        <div className="w-full h-full overflow-y-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-6 sm:pb-8 md:px-12 lg:px-24 bg-transparent relative">
            <header className="mb-6 sm:mb-8 text-center mt-2 sm:mt-4">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white drop-shadow-md mb-3 sm:mb-4">Cultural Gallery</h2>
                <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg font-medium font-sans px-2">
                    Explore the diverse tapestry of Indian heritage — classical dances, ancient monuments, and crafts. Click any tile to dive deep.
                </p>
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 sm:mb-12">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2
                            ${activeTab === tab
                                ? 'bg-white/30 backdrop-blur-md text-white shadow-md scale-[1.02] border border-white/50'
                                : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Masonry Grid Layout using CSS columns */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                <AnimatePresence>
                    {filteredArts.map((art) => (
                        <motion.button
                            key={art.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setSelectedArt(art)}
                            className="w-full break-inside-avoid relative group rounded-[1.5rem] overflow-hidden bg-white/10 backdrop-blur-xl shadow-md hover:shadow-2xl hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 text-left hover:-translate-y-1.5 border border-white/20 hover:border-white/40"
                            aria-label={`View details for ${art.title} - ${art.state}`}
                        >
                            <div style={{ height: art.height }} className="w-full overflow-hidden bg-white/5 relative">
                                <img
                                    src={hasImage(art.img) && !failedImageUrls.has(getImageUrl(art.img!)) ? getImageUrl(art.img!) : getFallbackImage(art.title ?? art.name, artTypeToFallbackType(art.type))}
                                    alt={art.title ?? ''}
                                    className="w-full h-full object-cover object-center bg-slate-200 group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                    onError={(e) => {
                                        const src = (e.target as HTMLImageElement).currentSrc;
                                        handleImageError(src, getFallbackImage(art.title ?? art.name, artTypeToFallbackType(art.type)), e);
                                    }}
                                />
                                {/* Glassmorphic gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 sm:opacity-0 sm:group-hover:opacity-80 transition-opacity duration-500" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-500">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-widest rounded-full mb-2 uppercase shadow-sm">
                                    {art.type}
                                </span>
                                <h3 className="text-xl font-serif text-white font-bold leading-tight drop-shadow-md mb-1">{art.title}</h3>
                                <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-white/50 drop-shadow-sm" />
                                    {art.state}
                                </p>
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            {/* Expanded Detailed View Overlay */}
            <AnimatePresence>
                {selectedArt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/50 backdrop-blur-md"
                        onClick={() => setSelectedArt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/20 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative bg-white/5">
                                <img
                                    src={hasImage(selectedArt.img) && !failedImageUrls.has(getImageUrl(selectedArt.img!)) ? getImageUrl(selectedArt.img!) : getFallbackImage(selectedArt.title ?? selectedArt.name, artTypeToFallbackType(selectedArt.type))}
                                    alt={selectedArt.title ?? ''}
                                    className="w-full h-full object-cover object-center opacity-90"
                                    onError={(e) => {
                                        const src = (e.target as HTMLImageElement).currentSrc;
                                        handleImageError(src, getFallbackImage(selectedArt.title ?? selectedArt.name, artTypeToFallbackType(selectedArt.type)), e);
                                    }}
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-bold tracking-widest uppercase rounded-full shadow-lg">
                                        {selectedArt.type}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-transparent relative">
                                <button
                                    onClick={() => setSelectedArt(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 shadow-sm transition-colors focus:ring-2 focus:ring-white border border-white/20"
                                    aria-label="Close details"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-2 text-white/70 font-bold mb-4">
                                    <MapPin className="w-5 h-5" />
                                    <span className="text-lg">{selectedArt.state}</span>
                                </div>

                                <h2 className="text-4xl font-serif text-white font-black drop-shadow-md mb-6">{selectedArt.title}</h2>

                                <div className="space-y-4">
                                    <p className="text-lg text-white/90 font-medium leading-relaxed">
                                        {selectedArt.desc}
                                    </p>

                                    {/* Rich details section for prototype filling */}
                                    <div className="p-6 bg-white/5 rounded-2xl border-2 border-white/10 shadow-sm mt-8">
                                        <h4 className="text-white font-bold mb-2">Historical Significance</h4>
                                        <p className="text-white/70 leading-relaxed">
                                            {selectedArt.historical_significance || "This art form has been passed down through generations, strictly adhering to ancient principles while evolving subtly over time. Used historically for storytelling, worship, and celebrating changing seasons, it forms a core part of the intangible cultural heritage of India."}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-2xl border-2 border-white/10 shadow-sm">
                                        <h4 className="text-white font-bold mb-2">Materials & Process</h4>
                                        <p className="text-white/70 leading-relaxed">
                                            {selectedArt.materials || "Natural dyes, locally sourced materials, and intricate manual processes are the hallmarks of this tradition. The skill requires years of rigorous practice, often starting from a very young age under the guidance of a master artisan."}
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

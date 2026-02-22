import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import statesData from '../data/states.json';

const ArtFormsPage = () => {
    const [activeTab, setActiveTab] = useState('All');

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

    const [selectedArt, setSelectedArt] = useState<any | null>(null);

    // Stop scrolling on body when modal is open
    if (typeof document !== 'undefined') {
        document.body.style.overflow = selectedArt ? 'hidden' : 'auto';
    }

    return (
        <div className="w-full h-full overflow-y-auto px-6 py-8 md:px-12 lg:px-24 bg-[var(--color-surface-warm)] relative">
            <header className="mb-8 text-center mt-4">
                <h2 className="text-5xl md:text-6xl font-serif text-[var(--color-brand-primary)] mb-4 drop-shadow-sm font-black tracking-tight">Cultural Gallery</h2>
                <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-lg font-medium font-sans">
                    Explore the diverse tapestry of Indian heritage, from classical dances to ancient monuments. Click any tile to dive deep.
                </p>
            </header>

            {/* Chic Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 focus:outline-none shadow-sm
                            ${activeTab === tab
                                ? 'bg-slate-900 text-white shadow-md scale-105 transform'
                                : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-0.5 border border-slate-200'}
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
                            className="w-full break-inside-avoid relative group rounded-[1.5rem] overflow-hidden bg-white shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-secondary)] text-left hover:-translate-y-2 border border-slate-100"
                            aria-label={`View details for ${art.title} - ${art.state}`}
                        >
                            <div style={{ height: art.height }} className="w-full overflow-hidden bg-gray-100 relative">
                                <img
                                    src={art.img}
                                    alt={art.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
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
                                    <MapPin className="w-3 h-3 text-[var(--color-brand-accent)] drop-shadow-sm" />
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedArt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                                <img src={selectedArt.img} alt={selectedArt.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-[var(--color-brand-primary)] text-sm font-bold tracking-widest uppercase rounded-full shadow-lg">
                                        {selectedArt.type}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-[var(--color-surface-warm)] relative">
                                <button
                                    onClick={() => setSelectedArt(null)}
                                    className="absolute top-6 right-6 p-2 bg-white rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-brand-secondary)] hover:bg-[var(--color-surface-muted)] shadow-sm transition-colors focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                                    aria-label="Close details"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-2 text-[var(--color-brand-accent)] font-bold mb-4">
                                    <MapPin className="w-5 h-5" />
                                    <span className="text-lg">{selectedArt.state}</span>
                                </div>

                                <h2 className="text-4xl font-serif text-[var(--color-brand-primary)] font-black mb-6">{selectedArt.title}</h2>

                                <div className="space-y-4">
                                    <p className="text-lg text-[var(--color-text-main)] font-medium leading-relaxed">
                                        {selectedArt.desc}
                                    </p>

                                    {/* Rich details section for prototype filling */}
                                    <div className="p-6 bg-white rounded-2xl border-2 border-[var(--color-surface-muted)] shadow-sm mt-8">
                                        <h4 className="text-[var(--color-brand-secondary)] font-bold mb-2">Historical Significance</h4>
                                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                                            {selectedArt.historical_significance || "This art form has been passed down through generations, strictly adhering to ancient principles while evolving subtly over time. Used historically for storytelling, worship, and celebrating changing seasons, it forms a core part of the intangible cultural heritage of India."}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white rounded-2xl border-2 border-[var(--color-surface-muted)] shadow-sm">
                                        <h4 className="text-[var(--color-brand-purple)] font-bold mb-2">Materials & Process</h4>
                                        <p className="text-[var(--color-text-muted)] leading-relaxed">
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

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Image as ImageIcon } from 'lucide-react';
import statesData from '../data/states.json';
import { getImageUrl, hasImage } from '../utils/imageUrl';
import { getFallbackImage } from '../utils/fallbackImages';
import MudraModelViewer from '../components/core/MudraModelViewer';

// --- Mudra model data ---
const SINGLE_HAND_MUDRAS = [
  'Alapadma', 'Arala', 'Ardhachandra', 'Ardhapataka', 'Bhramara', 'Catura',
  'Chandrakala', 'Hamsapaksa', 'Hamsaya', 'Kangula', 'Kapittha', 'Kartarinukha',
  'Katakamukha', 'Mayura', 'Mrgasirsa', 'Mukula', 'Musti', 'Padmakosa',
  'Pataka', 'Sandamsa', 'Sarpashirsa', 'Simhamukha', 'Suchi', 'Sukatunda',
  'Tamracuda', 'Tripataka', 'Trisula', 'sikhara',
];

const TWO_HAND_MUDRAS = [
  'anjali', 'Bherunda', 'Chakra', 'Dola', 'Garuda', 'kapota',
  'karkata', 'Kartarisvastika', 'Katakavardhana', 'Katva', 'Kilaka', 'Kurma',
  'Matsya', 'Nagabandha', 'Pasa', 'puspaputa', 'Sakata', 'Sankha',
  'Sivalinga', 'svastika', 'Utsanga', 'Varaha',
];

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
    artists?: string;
    images?: string[];
    artists_images?: string[];
    single_gestures?: string;
    single_gestures_images?: string[];
    joint_gestures?: string;
    joint_gestures_images?: string[];
    navrasas?: string;
    navrasas_images?: string[];
}

function artTypeToFallbackType(t: string): string {
    if (t === 'Handicrafts') return 'handicraft';
    if (t === 'Performing Arts' || t === 'Folk Dance' || t === 'Classical Dance') return 'performing arts';
    return t;
}

const ImageGallery = ({ images, title }: { images: string[], title: string }) => {
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    if (!images || images.length === 0) return null;
    return (
        <>
        <div className="mt-4">
            <h5 className="text-white/90 font-bold mb-2 text-sm flex items-center gap-1"><ImageIcon className="w-4 h-4"/> {title}</h5>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
                {images.map((img, idx) => (
                    <img 
                        key={idx} 
                        src={getImageUrl(img)} 
                        alt={`${title} ${idx}`} 
                        className="h-24 w-auto rounded-lg border border-white/10 object-cover shrink-0 bg-white/5 cursor-pointer hover:scale-105 hover:border-amber-400/50 hover:shadow-lg transition-all" 
                        onClick={(e) => { e.stopPropagation(); setSelectedImg(getImageUrl(img)); }}
                    />
                ))}
            </div>
        </div>

        {/* Floating Expanded Viewer */}
        <AnimatePresence>
            {selectedImg && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-3xl max-h-[50vh] w-full flex justify-center"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
                            className="absolute sm:-right-12 sm:top-0 -top-12 right-0 p-2.5 bg-black/50 backdrop-blur-lg hover:bg-white/20 rounded-full border border-white/20 transition-all text-white shadow-xl hover:rotate-90 hover:scale-110 z-[210]"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img 
                            src={selectedImg} 
                            alt={`Expanded ${title}`} 
                            className="w-full h-full max-h-[45vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 bg-transparent"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
}

const HastaMudrasSection = () => {
    const [mudraTab, setMudraTab] = useState<'single' | 'two'>('single');
    const mudras = mudraTab === 'single' ? SINGLE_HAND_MUDRAS : TWO_HAND_MUDRAS;
    const basePath = mudraTab === 'single' ? '/models/single-hand' : '/models/two-hand';

    return (
        <div className="mt-12 pt-16 border-t border-white/20 pb-8">
            <header className="mb-10 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#ffd700] drop-shadow-md mb-4">
                    Hasta Mudras
                </h2>
                <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg font-medium font-sans px-2">
                    Explore the ancient hand gestures of Indian classical dance — interact with each 3D model by rotating and zooming.
                </p>
            </header>

            {/* Single / Two-hand tabs */}
            <div className="flex justify-center gap-3 mb-10">
                <button
                    onClick={() => setMudraTab('single')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-250 border ${
                        mudraTab === 'single'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md scale-[1.02]'
                            : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    Asamyukta (Single Hand)
                </button>
                <button
                    onClick={() => setMudraTab('two')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-250 border ${
                        mudraTab === 'two'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-md scale-[1.02]'
                            : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    Samyukta (Two Hands)
                </button>
            </div>

            {/* 3D Model Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                <AnimatePresence mode="wait">
                    {mudras.map((name) => (
                        <MudraModelViewer
                            key={name}
                            name={name}
                            src={`${basePath}/${name}.glb`}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ArtFormsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

    const handleImageError = useCallback((failedUrl: string, fallbackUrl: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        setFailedImageUrls(prev => new Set(prev).add(failedUrl));
        (e.target as HTMLImageElement).src = fallbackUrl;
    }, []);

    // Flatten all art forms from states.json into a single array
    const allArtForms = useMemo(() => {
        const compiled: ArtFormItem[] = [];
        const heights = [300, 400, 250, 380, 320, 280, 350, 310]; // staggered masonry looks
        let hIdx = 0;

        statesData.states.forEach(state => {
            if (state.art_forms) {
                state.art_forms.paintings?.forEach(p => {
                    compiled.push({ ...p, id: `p-${p.id}`, state: state.name, type: 'Painting', height: heights[hIdx++ % heights.length] });
                });
                state.art_forms.performing_arts?.forEach(p => {
                    compiled.push({ ...p, id: `pa-${p.id}`, state: state.name, type: 'Performing Arts', height: heights[hIdx++ % heights.length] });
                });
                state.art_forms.handicrafts?.forEach(p => {
                    compiled.push({ ...p, id: `hc-${p.id}`, state: state.name, type: 'Handicrafts', height: heights[hIdx++ % heights.length] });
                });
                // Check for injected dynamic dance forms
                const stateArtForms = state.art_forms as Record<string, unknown>;
                if (stateArtForms.dance_forms) {
                    const df = stateArtForms.dance_forms as Record<string, unknown[]>;
                    df.folk?.forEach((f: unknown) => {
                        const folk = f as ArtFormItem;
                        compiled.push({ ...folk, id: `fd-${folk.id}`, title: folk.name, state: state.name, type: 'Folk Dance', height: heights[hIdx++ % heights.length] });
                    });
                }
            }
            if (state.monuments) {
                state.monuments.forEach(m => {
                    if (m.img) compiled.push({ ...m, id: `m-${m.id}`, title: m.name, state: state.name, type: 'Monument', height: heights[hIdx++ % heights.length] });
                })
            }
            if (state.fairs_and_festivals) {
                state.fairs_and_festivals.forEach(f => {
                    if (f.img) compiled.push({ ...f, id: `f-${f.id}`, title: f.name, state: state.name, type: 'Festival', height: heights[hIdx++ % heights.length] });
                })
            }
        });

        // Shuffle first for masonry variety
        const shuffled = compiled.sort(() => 0.5 - Math.random());
        
        // Then sort by presence of real images (true comes before false)
        return shuffled.sort((a, b) => {
            const aHas = hasImage(a.img);
            const bHas = hasImage(b.img);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
        });
    }, []);

    const classicalDances = useMemo(() => {
        const dances: ArtFormItem[] = [];
        const stateDataAny = statesData as Record<string, unknown>;
        const raw = (stateDataAny.global_classical_dances as unknown[]) || [];
        raw.forEach((d: unknown) => {
            const dance = d as ArtFormItem;
            dances.push({ ...dance, title: dance.name, type: 'Classical Dance', state: 'Pan-India / Origins Vary', height: 350 });
        });
        return dances;
    }, []);

    const filteredArts = useMemo(() => {
        const baseSet = activeTab === 'All' ? allArtForms : allArtForms.filter(art => {
            if (activeTab === 'Monuments' && art.type === 'Monument') return true;
            if (activeTab === 'Festivals' && art.type === 'Festival') return true;
            if (activeTab === 'Folk Dance' && art.type === 'Folk Dance') return true;
            return art.type === activeTab;
        });

        // Aggressively re-sort the UI dynamically: anything that results in a 404 fallback sinks to the bottom!
        return [...baseSet].sort((a, b) => {
            const aValid = hasImage(a.img) && !failedImageUrls.has(getImageUrl(a.img!));
            const bValid = hasImage(b.img) && !failedImageUrls.has(getImageUrl(b.img!));
            
            if (aValid && !bValid) return -1;
            if (!aValid && bValid) return 1;
            return 0; // Maintain original masonry shuffle order if logically tied
        });
    }, [activeTab, allArtForms, failedImageUrls]);

    const tabs = ['All', 'Painting', 'Performing Arts', 'Handicrafts', 'Monuments', 'Festivals', 'Folk Dance'];

    const [selectedArt, setSelectedArt] = useState<ArtFormItem | null>(null);

    if (typeof document !== 'undefined') {
        document.body.style.overflow = selectedArt ? 'hidden' : 'auto';
    }

    return (
        <div className="w-full min-h-full overflow-y-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-8 md:px-12 lg:px-24 bg-transparent relative overflow-x-hidden">
            <header className="mb-6 sm:mb-8 text-center mt-2 sm:mt-4">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white drop-shadow-md mb-3 sm:mb-4">Cultural Gallery</h2>
                <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg font-medium font-sans px-2">
                    Explore the diverse tapestry of Indian heritage — ancient monuments, festivals, paintings, and folk arts. Click any tile to dive deep.
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
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6 pb-16">
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
                        >
                            <div style={{ height: art.height }} className="w-full overflow-hidden bg-white/5 relative">
                                <img
                                    src={hasImage(art.img) && !failedImageUrls.has(getImageUrl(art.img!)) ? getImageUrl(art.img!) : getFallbackImage(art.title ?? art.name, artTypeToFallbackType(art.type))}
                                    alt={art.title ?? ''}
                                    className="w-full h-full object-cover object-center bg-slate-200 group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                    onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(art.title ?? art.name, artTypeToFallbackType(art.type)), e)}
                                />
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

            {/* ═══ Hasta Mudras — 3D Hand Gesture Gallery ═══ */}
            <HastaMudrasSection />

            {/* Dedicated Classical Dance Section */}
            {classicalDances.length > 0 && (
                <div className="mt-8 pt-16 border-t border-white/20 pb-20">
                    <header className="mb-12 text-center">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white drop-shadow-md mb-4 text-[#ffd700]">Classical Dance Forms</h2>
                        <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg font-medium font-sans px-2">
                            The 8 principal classical dance forms of India originated from the 'Natya Shastra'. They express the 9 bhavas or navrasas with intricate body postures and hand gestures.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {classicalDances.map((art) => (
                             <motion.button
                                 key={art.id}
                                 whileHover={{ scale: 1.02, y: -5 }}
                                 onClick={() => setSelectedArt(art)}
                                 className="relative group rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl shadow-xl border border-white/10 hover:border-[#ffd700]/50 transition-all duration-300 text-left"
                             >
                                 <div className="h-64 w-full relative">
                                     <img
                                         src={hasImage(art.img) && !failedImageUrls.has(getImageUrl(art.img!)) ? getImageUrl(art.img!) : getFallbackImage(art.title ?? art.name, 'performing arts')}
                                         alt={art.title ?? ''}
                                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                         loading="lazy"
                                         onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(art.title ?? art.name, 'performing arts'), e)}
                                     />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                     <div className="absolute bottom-0 left-0 p-5">
                                        <h3 className="text-2xl font-serif text-[#ffd700] font-bold drop-shadow-md mb-1">{art.title}</h3>
                                        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{art.state}</p>
                                     </div>
                                 </div>
                             </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Expanded Detailed View Overlay */}
            <AnimatePresence>
                {selectedArt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12 bg-black/60 backdrop-blur-lg overflow-y-auto"
                        onClick={() => setSelectedArt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 12 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="bg-zinc-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl ring-1 ring-white/20 relative my-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full md:w-5/12 min-h-[250px] md:h-auto overflow-hidden relative shrink-0">
                                <img
                                    src={hasImage(selectedArt.img) && !failedImageUrls.has(getImageUrl(selectedArt.img!)) ? getImageUrl(selectedArt.img!) : getFallbackImage(selectedArt.title ?? selectedArt.name, artTypeToFallbackType(selectedArt.type))}
                                    alt={selectedArt.title ?? ''}
                                    className="w-full h-full object-cover object-top opacity-90"
                                    onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(selectedArt.title ?? selectedArt.name, artTypeToFallbackType(selectedArt.type)), e)}
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-4 py-1.5 bg-black/50 backdrop-blur-md text-white border border-white/20 text-xs font-bold tracking-widest uppercase rounded-full shadow-lg">
                                        {selectedArt.type}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 overflow-y-auto bg-transparent relative min-h-0 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedArt(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 shadow-sm transition-colors focus:ring-2 focus:ring-white border border-white/20 z-10"
                                    aria-label="Close details"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2 text-[#ffd700] font-bold mb-3">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm tracking-wide uppercase">{selectedArt.state}</span>
                                </div>

                                <h2 className="text-3xl sm:text-5xl font-serif text-white font-black drop-shadow-md mb-6">{selectedArt.title}</h2>

                                <div className="space-y-6">
                                    {selectedArt.desc && (
                                        <p className="text-[17px] text-white/90 font-medium leading-relaxed whitespace-pre-wrap">
                                            {selectedArt.desc}
                                        </p>
                                    )}

                                    <ImageGallery title="Additional Images" images={selectedArt.images || []} />

                                    {selectedArt.artists && (
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                            <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Renowned Artists</h4>
                                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selectedArt.artists}</p>
                                            <ImageGallery title="Artist Portraits" images={selectedArt.artists_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.single_gestures && (
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                            <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Asamyukta Hastamudras (Single Hand Gestures)</h4>
                                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selectedArt.single_gestures}</p>
                                            <ImageGallery title="Gesture References" images={selectedArt.single_gestures_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.joint_gestures && (
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                            <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Samyukta Hastamudras (Joint Hand Gestures)</h4>
                                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selectedArt.joint_gestures}</p>
                                            <ImageGallery title="Gesture References" images={selectedArt.joint_gestures_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.navrasas && (
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                            <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Navrasas (Expressions)</h4>
                                            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selectedArt.navrasas}</p>
                                            <ImageGallery title="Expression References" images={selectedArt.navrasas_images || []} />
                                        </div>
                                    )}

                                    {/* Fallback structure for older data without these fields */}
                                    {!selectedArt.artists && !selectedArt.single_gestures && (
                                        <>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                                <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Historical Significance</h4>
                                                <p className="text-white/80 leading-relaxed">
                                                    {selectedArt.historical_significance || "This art form forms a core part of the intangible cultural heritage of its region."}
                                                </p>
                                            </div>
                                            {(selectedArt.materials || selectedArt.type === 'Handicrafts') && (
                                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                                    <h4 className="text-[#ffd700] font-bold mb-2 uppercase text-sm tracking-wider">Materials & Process</h4>
                                                    <p className="text-white/80 leading-relaxed">
                                                        {selectedArt.materials || "Natural materials and intricate manual processes are the hallmarks of this tradition."}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
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

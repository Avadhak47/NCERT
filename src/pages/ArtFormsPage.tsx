import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Image as ImageIcon, Globe, BookOpen, Info } from 'lucide-react';
import statesData from '../data/states.json';
import extraArtFormsData from '../data/extra_artforms.json';
import { getImageUrl, hasImage } from '../utils/imageUrl';
import { getFallbackImage } from '../utils/fallbackImages';
import MudraModelViewer from '../components/core/MudraModelViewer';
import mudraDescriptions from '../data/mudras.json';

// --- Predefined External Links Map ---
const EXTERNAL_LINKS: Record<string, string> = {
    'Painting': 'https://www.india.gov.in/topics/art-culture/paintings',
    'Performing Arts': 'https://www.indiaculture.gov.in/performing-arts',
    'Classical Dance': 'https://sangeetnatak.gov.in/sna/classicaldance.html',
    'Handicrafts': 'https://www.handicrafts.nic.in/',
    'Monument': 'https://asi.nic.in/alphabetical-list-of-monuments/',
    'Festival': 'https://www.india.gov.in/topics/art-culture/fairs-festivals',
    'GI Tags': 'https://ipindia.gov.in/gi-glimpses.htm',
    'default': 'https://www.google.com/search?q=Indian+heritage+'
};

const getExternalLink = (type: string, title: string) => {
    const base = EXTERNAL_LINKS[type] || EXTERNAL_LINKS['default'];
    return `${base}${encodeURIComponent(title)}`;
};

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
            <h5 className="text-slate-800 font-bold mb-2 text-sm flex items-center gap-1"><ImageIcon className="w-4 h-4"/> {title}</h5>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
                {images.map((img, idx) => (
                    <img 
                        key={idx} 
                        src={getImageUrl(img)} 
                        alt={`${title} ${idx}`} 
                        className="h-24 w-auto rounded-lg border border-slate-200 object-cover shrink-0 bg-slate-50 cursor-pointer hover:scale-105 hover:border-[var(--color-brand-primary)]/50 hover:shadow-lg transition-all" 
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
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/20 backdrop-blur-3xl"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-3xl max-h-[70vh] w-full flex justify-center"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
                            className="absolute sm:-right-12 sm:top-0 -top-12 right-0 p-2.5 bg-white/40 backdrop-blur-lg hover:bg-white/80 rounded-full border border-white/40 transition-all text-slate-800 shadow-xl hover:rotate-90 hover:scale-110 z-[210]"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img 
                            src={selectedImg} 
                            alt={`Expanded ${title}`} 
                            className="w-full h-full max-h-[65vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/50 bg-white/20 backdrop-blur-xl"
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
        <div className="pb-8">
            {/* Single / Two-hand tabs */}
            <div className="flex justify-center gap-3 mb-10">
                <button
                    onClick={() => setMudraTab('single')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-250 border shadow-sm ${
                        mudraTab === 'single'
                            ? 'bg-white text-black border-slate-300 scale-[1.05] z-10'
                            : 'bg-white/40 backdrop-blur-md text-slate-800 border-white/40 hover:bg-white/60 hover:text-black'
                    }`}
                >
                    Asamyukta (Single Hand)
                </button>
                <button
                    onClick={() => setMudraTab('two')}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-250 border shadow-sm ${
                        mudraTab === 'two'
                            ? 'bg-white text-black border-slate-300 scale-[1.05] z-10'
                            : 'bg-white/40 backdrop-blur-md text-slate-800 border-white/40 hover:bg-white/60 hover:text-black'
                    }`}
                >
                    Samyukta (Two Hands)
                </button>
            </div>

            {/* 3D Model Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                <AnimatePresence mode="wait">
                    {mudras.map((name) => {
                        const description = (mudraTab === 'single' 
                            ? (mudraDescriptions.single as Record<string, string>)[name] 
                            : (mudraDescriptions.two as Record<string, string>)[name]) || "Cultural hand gesture used in Indian classical dance.";
                        
                        return (
                            <MudraModelViewer
                                key={`${mudraTab}-${name}`}
                                name={name}
                                src={`${basePath}/${name}.glb`}
                                description={description}
                                label={mudraTab === 'single' ? 'Asamyukta Hasta' : 'Samyukta Hasta'}
                            />
                        );
                    })}
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

        // Add dynamically parsed extra art forms (GI Tags, Songs, Facts)
        extraArtFormsData.forEach((art: any) => {
            // Include everything except Key Facts (they are in Explore marquee now)
            if (art.type !== 'Key Facts') {
                compiled.push({ ...art, height: heights[hIdx++ % heights.length] });
            }
        });

        // Add Classical Dances
        const stateDataAny = statesData as Record<string, unknown>;
        const rawClassical = (stateDataAny.global_classical_dances as unknown[]) || [];
        rawClassical.forEach((d: unknown) => {
            const dance = d as ArtFormItem;
            compiled.push({ 
                ...dance, 
                id: `cd-${dance.id}`, 
                title: dance.name, 
                type: 'Classical Dance', 
                state: 'Pan-India', 
                height: heights[hIdx++ % heights.length] 
            });
        });

        // Shuffle first for masonry variety
        const shuffled = compiled.sort(() => 0.5 - Math.random());
        
        // Then sort by weight (GI Tags with desc, then others with images)
        return shuffled.sort((a, b) => {
            // Priority 1: GI Tags with long descriptions (User request: more info comes up)
            if (a.type === 'GI Tags' || b.type === 'GI Tags') {
                const aWeight = a.type === 'GI Tags' ? (a.desc?.length || 0) : -1;
                const bWeight = b.type === 'GI Tags' ? (b.desc?.length || 0) : -1;
                if (aWeight !== bWeight) return bWeight - aWeight;
            }

            const aHas = hasImage(a.img);
            const bHas = hasImage(b.img);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
        });
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

    const tabs = ['All', 'Painting', 'Performing Arts', 'Classical Dance', 'Handicrafts', 'Monuments', 'Festivals', 'Folk Dance', 'GI Tags', 'Songs & Artists', 'Hasta Mudra'];

    const [selectedArt, setSelectedArt] = useState<ArtFormItem | null>(null);

    if (typeof document !== 'undefined') {
        document.body.style.overflow = selectedArt ? 'hidden' : 'auto';
    }

    return (
        <div className="w-full min-h-full overflow-y-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-8 md:px-12 lg:px-24 bg-transparent relative overflow-x-hidden">
            <header className="mb-6 sm:mb-8 text-center mt-2 sm:mt-4">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-black drop-shadow-sm mb-3 sm:mb-4">Cultural Gallery</h2>
                <p className="text-black max-w-2xl mx-auto text-base sm:text-lg font-bold font-sans px-2 opacity-100">
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
                                ? 'bg-white text-black shadow-md scale-[1.02] border border-white/60 font-black'
                                : 'bg-white/60 text-black font-bold hover:bg-white border border-white/40 hover:border-white/60 backdrop-blur-sm'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="mb-16 min-h-[60vh]">
                <AnimatePresence mode="wait">
                    {activeTab === 'Hasta Mudra' ? (
                        <motion.div
                            key="mudra-tab"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                        >
                            <HastaMudrasSection />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="masonry-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6"
                        >
                            {filteredArts.map((art) => {
                                const isGlossary = !hasImage(art.img) || failedImageUrls.has(getImageUrl(art.img!));
                            
                            return (
                                <motion.button
                                    key={art.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    onClick={() => setSelectedArt(art)}
                                    className={`w-full break-inside-avoid relative group rounded-[1.5rem] overflow-hidden transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-primary)]/50 text-left hover:-translate-y-1.5 border border-white/50 hover:border-white/80 ${isGlossary ? 'bg-white/60 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center shadow-sm' : 'bg-white/40 backdrop-blur-xl shadow-sm hover:shadow-xl hover:bg-white/60'}`}
                                >
                                    {!isGlossary ? (
                                        <>
                                            <div style={{ height: art.height }} className="w-full overflow-hidden bg-slate-100/50 relative">
                                                <img
                                                    src={getImageUrl(art.img!)}
                                                    alt={art.title ?? ''}
                                                    className="w-full h-full object-cover object-center bg-slate-200/50 group-hover:scale-105 transition-transform duration-700"
                                                    loading="lazy"
                                                    onError={(e) => handleImageError((e.target as HTMLImageElement).currentSrc, getFallbackImage(art.title ?? art.name, artTypeToFallbackType(art.type)), e)}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 sm:opacity-40 sm:group-hover:opacity-80 transition-opacity duration-500" />
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-md border border-white/40 text-black text-[9px] font-black tracking-widest rounded-full mb-2 uppercase shadow-sm">
                                                    {art.type}
                                                </span>
                                                <h3 className="text-xl font-serif text-white font-black leading-tight drop-shadow-lg mb-1">{art.title}</h3>
                                                <p className="text-white text-[10px] font-bold flex items-center gap-1 opacity-90">
                                                    <MapPin className="w-3 h-3 text-white drop-shadow-sm" />
                                                    {art.state}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 px-4 flex flex-col items-center">
                                            <span className="inline-block px-2 py-0.5 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-[9px] font-bold tracking-widest rounded-full mb-4 uppercase">
                                                {art.type}
                                            </span>
                                            <h3 className="text-2xl font-serif text-slate-900 font-black leading-tight mb-3 tracking-tight">{art.title}</h3>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-4">
                                                <MapPin className="w-3 h-3 text-[var(--color-brand-primary)]" />
                                                {art.state}
                                            </p>
                                            <div className="w-10 h-1 bg-slate-200 rounded-full mb-4" />
                                            <p className="text-xs text-slate-600 font-medium line-clamp-4 leading-relaxed">
                                                {art.desc || "Digital documentation for this cultural asset is in progress."}
                                            </p>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Bottom Padding instead of the component call here */}
            <div className="h-20" />


            {/* Expanded Detailed View Overlay */}
            <AnimatePresence>
                {selectedArt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12 bg-slate-950/40 backdrop-blur-lg overflow-y-auto"
                        onClick={() => setSelectedArt(null)}
                    >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 12 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="bg-white/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl border border-white/50 relative my-4"
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
                                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 text-xs font-bold tracking-widest uppercase rounded-full shadow-sm">
                                        {selectedArt.type}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 overflow-y-auto bg-transparent relative min-h-0 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedArt(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/40 backdrop-blur-md rounded-full text-slate-800 hover:bg-white/60 shadow-sm transition-colors focus:ring-2 focus:ring-[var(--color-brand-primary)] border border-white/50 z-10"
                                    aria-label="Close details"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2 text-[var(--color-brand-primary)] font-bold mb-3">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm tracking-wide uppercase">{selectedArt.state}</span>
                                </div>

                                <h2 className="text-3xl sm:text-5xl font-serif text-black font-black drop-shadow-sm mb-6 uppercase tracking-tighter">{selectedArt.title}</h2>

                                <div className="space-y-6">
                                    {selectedArt.desc && (
                                        <p className="text-[17px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                            {selectedArt.desc}
                                        </p>
                                    )}

                                    <ImageGallery title="Additional Images" images={selectedArt.images || []} />

                                    {selectedArt.artists && (
                                        <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                            <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Renowned Artists</h4>
                                            <p className="text-slate-950 leading-relaxed whitespace-pre-wrap font-medium">{selectedArt.artists}</p>
                                            <ImageGallery title="Artist Portraits" images={selectedArt.artists_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.single_gestures && (
                                        <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                            <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Asamyukta Hastamudras (Single Hand Gestures)</h4>
                                            <p className="text-slate-950 leading-relaxed whitespace-pre-wrap font-medium">{selectedArt.single_gestures}</p>
                                            <ImageGallery title="Gesture References" images={selectedArt.single_gestures_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.joint_gestures && (
                                        <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                            <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Samyukta Hastamudras (Joint Hand Gestures)</h4>
                                            <p className="text-slate-950 leading-relaxed whitespace-pre-wrap font-medium">{selectedArt.joint_gestures}</p>
                                            <ImageGallery title="Gesture References" images={selectedArt.joint_gestures_images || []} />
                                        </div>
                                    )}

                                    {selectedArt.navrasas && (
                                        <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                            <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Navrasas (Expressions)</h4>
                                            <p className="text-black leading-relaxed whitespace-pre-wrap font-semibold">{selectedArt.navrasas}</p>
                                            <ImageGallery title="Expression References" images={selectedArt.navrasas_images || []} />
                                        </div>
                                    )}

                                    {/* Fallback structure for older data without these fields */}
                                    {!selectedArt.artists && !selectedArt.single_gestures && (
                                        <>
                                            <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                                <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Historical Significance</h4>
                                                <p className="text-slate-950 font-medium leading-relaxed">
                                                    {selectedArt.historical_significance || "This art form forms a core part of the intangible cultural heritage of its region."}
                                                </p>
                                            </div>
                                            {(selectedArt.materials || selectedArt.type === 'Handicrafts') && (
                                                <div className="p-5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
                                                    <h4 className="text-black font-black mb-2 uppercase text-sm tracking-wider">Materials & Process</h4>
                                                    <p className="text-slate-950 font-medium leading-relaxed">
                                                        {selectedArt.materials || "Natural materials and intricate manual processes are the hallmarks of this tradition."}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* External Links Section for Virasat Portal */}
                                    <div className="mt-8 pt-8 border-t border-white/40">
                                        <h4 className="text-black font-black mb-4 uppercase text-xs tracking-[0.2em]">Explore More References</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <a 
                                                href={getExternalLink(selectedArt.type, selectedArt.title || selectedArt.name || '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 text-black font-bold text-xs hover:bg-white hover:border-[var(--color-brand-primary)]/50 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <Globe className="w-4 h-4 text-[var(--color-brand-primary)]" />
                                                Ministry of Culture Portal
                                                <BookOpen className="w-3.5 h-3.5 opacity-50" />
                                            </a>
                                            <a 
                                                href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent((selectedArt.title || selectedArt.name || '') + ' ' + selectedArt.state)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-xl border border-white/40 text-black font-bold text-xs hover:bg-white hover:border-blue-300 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <Info className="w-4 h-4 text-blue-500" />
                                                Wikipedia Archive
                                                <BookOpen className="w-3.5 h-3.5 opacity-50" />
                                            </a>
                                        </div>
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

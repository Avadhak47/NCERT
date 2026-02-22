import React, { useMemo } from 'react';
import { X, Image as ImageIcon, BookOpen, MapPin, Landmark, Video, Globe, Users } from 'lucide-react';
import statesData from '../../data/states.json';

interface StateTileProps {
    stateId: string;
    stateName: string;
    onClose: () => void;
}

const StateTile: React.FC<StateTileProps> = ({ stateName, onClose }) => {
    // Look up the specific state from JSON
    const stateRecord = useMemo(() => {
        return statesData.states.find(s => s.name === stateName);
    }, [stateName]);

    return (
        <div className="w-full h-full bg-[var(--color-surface-warm)] flex flex-col z-50 text-[var(--color-text-main)] overflow-y-auto animate-[fadeIn_300ms_ease-out]">
            {/* Action Bar */}
            <div className="sticky top-0 w-full px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b-2 border-slate-200 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-[var(--color-brand-primary)] tracking-widest uppercase bg-[var(--color-brand-primary)]/10 px-4 py-1 rounded-full">Explore</span>
                    <span className="text-gray-400 font-bold">/</span>
                    <span className="text-lg font-bold text-slate-800">{stateName}</span>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-slate-100 transition-colors border-2 border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)] text-slate-600 font-bold"
                    aria-label="Back to Map"
                >
                    <X className="w-5 h-5 bg-slate-200 rounded-full p-0.5" /> Close Dashboard
                </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12 space-y-8">

                {/* Hero Section */}
                <div className="bg-white rounded-[2rem] shadow-xl border-4 border-white overflow-hidden flex flex-col md:flex-row relative group">
                    {/* 3D Model Placeholder Container */}
                    <div className="w-full md:w-1/3 bg-slate-50 border-r-2 border-slate-100 p-8 flex flex-col items-center justify-center relative min-h-[300px]">
                        <div className="absolute inset-x-0 top-4 text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive 3D Model</span>
                        </div>
                        {/* Spinning Cube CSS Placeholder */}
                        <div className="w-32 h-32 relative perspective-1000 mt-8 mb-4">
                            <div className="w-full h-full absolute preserve-3d animate-[spinCube_8s_linear_infinite]">
                                <div className="absolute w-full h-full border-4 border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/20 translate-z-16 flex items-center justify-center font-bold text-[var(--color-brand-primary)] backdrop-blur-sm rounded-xl">Front</div>
                                <div className="absolute w-full h-full border-4 border-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]/20 -translate-z-16 flex items-center justify-center font-bold text-[var(--color-brand-secondary)] backdrop-blur-sm rounded-xl">Back</div>
                                <div className="absolute w-full h-full border-4 border-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/20 rotate-y-90 translate-z-16 flex items-center justify-center font-bold text-[var(--color-brand-accent)] backdrop-blur-sm rounded-xl">Right</div>
                                <div className="absolute w-full h-full border-4 border-[var(--color-brand-purple)] bg-[var(--color-brand-purple)]/20 -rotate-y-90 translate-z-16 flex items-center justify-center font-bold text-[var(--color-brand-purple)] backdrop-blur-sm rounded-xl">Left</div>
                                <div className="absolute w-full h-full border-4 border-pink-500 bg-pink-500/20 rotate-x-90 translate-z-16 flex items-center justify-center font-bold text-pink-500 backdrop-blur-sm rounded-xl">Top</div>
                                <div className="absolute w-full h-full border-4 border-amber-500 bg-amber-500/20 -rotate-x-90 translate-z-16 flex items-center justify-center font-bold text-amber-500 backdrop-blur-sm rounded-xl">Bottom</div>
                            </div>
                        </div>
                        <button className="mt-8 bg-white px-5 py-2.5 rounded-full border-2 border-slate-200 text-sm font-bold text-slate-700 shadow-sm hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] hover:shadow-md transition-all flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Load Detailed Geography
                        </button>
                    </div>

                    {/* Hero Text */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 opacity-5 w-64 h-64 bg-[var(--color-brand-primary)] rounded-full blur-3xl z-0" />
                        <div className="z-10 relative">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-[var(--color-brand-primary)] drop-shadow-sm leading-tight mb-4">
                                {stateName}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mb-8">
                                {stateRecord?.facts?.[0] || `Dive into the rich tapestry of ${stateName}. From ancient monuments to vibrant folk dances, explore what makes this state a unique gem in India's crown.`}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <span className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold">
                                    <MapPin className="w-4 h-4" /> Capital: {stateRecord?.geography.capital || "Loading..."}
                                </span>
                                {stateRecord?.geography?.key_cities?.length ? (
                                    <span className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-bold">
                                        <Globe className="w-4 h-4" /> Major Cities: {stateRecord.geography.key_cities.length}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ARTICLE SECTIONS --- */}

                {/* 1. Key Cities */}
                {stateRecord?.geography?.key_cities && stateRecord.geography.key_cities.length > 0 && (
                    <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Globe className="w-8 h-8" /></div>
                            <h2 className="text-4xl font-serif font-black text-slate-800 tracking-tight">Key Cities</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stateRecord.geography.key_cities.map((city: any, idx) => (
                                <div key={idx} className="bg-slate-50/50 border-2 border-slate-100 p-6 rounded-3xl hover:border-blue-300 hover:bg-blue-50/30 transition-all hover:-translate-y-1">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{city.name}</h3>
                                    <p className="text-slate-500 font-mono text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full inline-block">{city.lat.toFixed(2)}° N, {city.lon.toFixed(2)}° E</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. Monuments (History & Architecture) */}
                {stateRecord?.monuments && stateRecord.monuments.length > 0 && (
                    <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Landmark className="w-8 h-8" /></div>
                            <h2 className="text-4xl font-serif font-black text-slate-800 tracking-tight">Heritage Monuments</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {stateRecord.monuments.map((monument: any) => (
                                <div key={monument.id} className="group relative rounded-[2rem] overflow-hidden shadow-lg aspect-video isolate bg-slate-100">
                                    <img src={monument.img || "https://images.unsplash.com/photo-1599839619721-397dd3ebf7f5?w=600&q=80"} alt={monument.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 -z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent -z-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-8 absolute bottom-0 left-0 right-0 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <h3 className="text-3xl font-serif font-bold mb-2 drop-shadow-md">{monument.name}</h3>
                                        <p className="text-slate-200 font-medium line-clamp-2 md:line-clamp-3 text-sm md:text-base">{monument.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Paintings & Visual Arts */}
                {stateRecord?.art_forms?.paintings && stateRecord.art_forms.paintings.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><ImageIcon className="w-6 h-6" /></div>
                            <h2 className="text-3xl font-serif font-black text-slate-800">Visual Arts & Paintings</h2>
                        </div>
                        <div className="space-y-12">
                            {stateRecord.art_forms.paintings.map((painting: any, idx: number) => (
                                <div key={painting.id || idx} className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="w-full md:w-5/12 aspect-square rounded-3xl overflow-hidden shadow-md shrink-0 border-4 border-slate-50">
                                        <img src={painting.img} alt={painting.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-serif font-bold text-[var(--color-brand-primary)] mb-4">{painting.title}</h3>
                                        <p className="text-lg text-slate-600 leading-relaxed mb-6">{painting.desc}</p>

                                        <div className="space-y-4">
                                            {painting.materials && (
                                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                    <span className="font-bold text-orange-800 block mb-1 text-sm uppercase tracking-wide">Materials Used</span>
                                                    <p className="text-slate-700">{painting.materials}</p>
                                                </div>
                                            )}
                                            {painting.historical_significance && (
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                    <span className="font-bold text-slate-800 block mb-1 text-sm uppercase tracking-wide">Historical Context</span>
                                                    <p className="text-slate-600 italic">"{painting.historical_significance}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Performing Arts */}
                {stateRecord?.art_forms?.performing_arts && stateRecord.art_forms.performing_arts.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Video className="w-6 h-6" /></div>
                            <h2 className="text-3xl font-serif font-black text-slate-800">Performing Arts</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {stateRecord.art_forms.performing_arts.map((art: any, idx: number) => (
                                <div key={art.id || idx} className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
                                    <div className="h-64 overflow-hidden">
                                        <img src={art.img} alt={art.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">{art.title}</h3>
                                        <p className="text-slate-600 mb-6 flex-1">{art.desc}</p>
                                        {art.materials && (
                                            <div className="mt-auto border-t border-slate-200 pt-4">
                                                <span className="font-bold text-purple-800 text-sm">Props & Decor: </span>
                                                <span className="text-slate-600 text-sm">{art.materials}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Fairs & Festivals */}
                {stateRecord?.fairs_and_festivals && stateRecord.fairs_and_festivals.length > 0 && (
                    <section className="bg-amber-50 rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-amber-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-200 text-amber-700 rounded-xl"><Users className="w-6 h-6" /></div>
                            <h2 className="text-3xl font-serif font-black text-amber-900">Fairs & Festivals</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stateRecord.fairs_and_festivals.map((fest, idx) => (
                                <div key={idx} className="bg-white border border-amber-200 p-6 rounded-2xl shadow-sm">
                                    <h3 className="text-xl font-bold text-amber-900 mb-2">{fest.name}</h3>
                                    <p className="text-amber-700/80 font-medium">{fest.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. Museums */}
                {stateRecord?.museums && stateRecord.museums.length > 0 && (
                    <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                            <h2 className="text-3xl font-serif font-black text-slate-800">Museums & Archives</h2>
                        </div>
                        <div className="space-y-4">
                            {stateRecord.museums.map((museum, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{museum.name}</h3>
                                        <p className="text-slate-600 mt-1">{museum.desc}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] transition-colors shrink-0">
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 7. Handicrafts */}
                {stateRecord?.art_forms?.handicrafts && stateRecord.art_forms.handicrafts.length > 0 && (
                    <section className="bg-rose-50 rounded-[2rem] p-8 md:p-12 shadow-sm border-2 border-rose-100 mb-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-rose-200 text-rose-700 rounded-xl"><ImageIcon className="w-6 h-6" /></div>
                            <h2 className="text-3xl font-serif font-black text-rose-900">Handicrafts</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {stateRecord.art_forms.handicrafts.map((craft: any, idx: number) => (
                                <div key={craft.id || idx} className="bg-white border border-rose-200 rounded-3xl overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                                    {craft.img && (
                                        <div className="h-64 overflow-hidden">
                                            <img src={craft.img} alt={craft.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    )}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">{craft.title}</h3>
                                        <p className="text-slate-600 mb-4">{craft.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- END ARTICLE SECTIONS --- */}

                {/* Media Gallery Teaser */}
                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-r from-[var(--color-brand-primary)] to-transparent skew-x-12" />
                    </div>
                    <div className="relative z-10 w-full md:w-1/2 mb-8 md:mb-0">
                        <h3 className="text-3xl font-serif font-black mb-4 flex items-center gap-3">
                            <Video className="w-8 h-8 text-pink-400" /> Virtual Tours
                        </h3>
                        <p className="text-slate-300 font-medium text-lg">
                            Immerse yourself in 360° videos and interactive walkthroughs of {stateName}'s most iconic locations.
                        </p>
                    </div>
                    <button className="relative z-10 px-8 py-4 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-pink-500 hover:text-white transition-colors shadow-xl hover:shadow-pink-500/50">
                        Start Tour Center
                    </button>
                </div>
            </div>

            <style>{`
               .perspective-1000 {
                   perspective: 1000px;
               }
               .preserve-3d {
                   transform-style: preserve-3d;
               }
               .translate-z-16 {
                   transform: translateZ(64px);
               }
               .-translate-z-16 {
                   transform: rotateY(180deg) translateZ(64px);
               }
               .rotate-y-90 {
                   transform: rotateY(90deg) translateZ(64px);
               }
               .-rotate-y-90 {
                   transform: rotateY(-90deg) translateZ(64px);
               }
               .rotate-x-90 {
                   transform: rotateX(90deg) translateZ(64px);
               }
               .-rotate-x-90 {
                   transform: rotateX(-90deg) translateZ(64px);
               }
               @keyframes spinCube {
                   0% { transform: rotateX(0deg) rotateY(0deg); }
                   100% { transform: rotateX(360deg) rotateY(360deg); }
               }
            `}</style>
        </div>
    );
};

export default StateTile;

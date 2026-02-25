

const AcknowledgementPage = () => {
    return (
        <div className="w-full h-full overflow-y-auto pt-28 sm:pt-36 pb-12 px-6 md:px-16 md:pb-16 flex justify-center bg-transparent">
            <div className="w-full max-w-3xl relative">
                {/* Museum style decorative frame */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20" />

                <div className="p-12 md:p-20 flex flex-col items-center text-center z-10 relative">
                    <h2 className="text-2xl md:text-4xl font-serif text-white/90 tracking-[0.2em] uppercase font-light drop-shadow-md">Acknowledgements</h2>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent my-10" />

                    <div className="flex flex-col gap-12 w-full max-w-sm">
                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/60 mb-3 uppercase">Concept & Content</h3>
                            <p className="text-xl font-serif text-white drop-shadow-sm mb-1">NCERT</p>
                            <p className="text-xs text-white/80 leading-relaxed font-sans">National Council of Educational<br />Research and Training</p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/60 mb-3 uppercase">Cartographic Data</h3>
                            <p className="text-xl font-serif text-white drop-shadow-sm mb-1">Survey of India</p>
                            <p className="text-xs text-white/80 leading-relaxed font-sans">Official boundary guidelines<br />and geospatial compliance</p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/60 mb-3 uppercase">Design Inspiration</h3>
                            <p className="text-xl font-serif text-white drop-shadow-sm mb-1">UNESCO Digital Museum</p>
                            <p className="text-xs text-white/80 leading-relaxed font-sans">Aesthetic guidelines and<br />accessibility frameworks</p>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/60 mb-3 uppercase">Platform Development</h3>
                            <p className="text-xl font-serif text-white drop-shadow-sm mb-1">Digital India Initiative</p>
                            <p className="text-xs text-white/80 leading-relaxed font-sans">Engineering and interactive<br />systems integration</p>
                        </section>
                    </div>

                    <div className="w-full mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-white/20 text-[10px] text-center font-sans tracking-[0.2em] uppercase text-white/50">
                        Designed for accessibility and digital inclusion
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcknowledgementPage;

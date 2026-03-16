import { useMemo } from 'react';
import glossaryData from '../data/glossary.json';

const GlossaryPage = () => {
    // Group by starting letter
    const groupedGlossary = useMemo(() => {
        const map = new Map<string, typeof glossaryData.terms>();
        glossaryData.terms.forEach(item => {
            const letter = item.term.charAt(0).toUpperCase();
            if (!map.has(letter)) {
                map.set(letter, []);
            }
            map.get(letter)?.push(item);
        });
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, []);

    const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    return (
        <div className="w-full min-h-full overflow-hidden flex flex-col md:flex-row relative bg-transparent">
            {/* Sidebar A–Z */}
            <aside className="w-full md:w-24 shrink-0 bg-white/10 backdrop-blur-3xl md:h-full overflow-x-auto md:overflow-y-auto z-10 p-2 pt-20 sm:pt-24 md:pt-32 pb-6 md:pb-8 flex flex-row md:flex-col gap-1.5 items-center justify-start md:justify-start no-scrollbar border-b md:border-b-0 md:border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
                {alphabet.map(letter => {
                    const hasEntries = groupedGlossary.some(([key]) => key === letter);
                    return (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className={`shrink-0 w-9 h-9 sm:w-8 md:w-10 aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent min-w-[2.25rem] ${hasEntries
                                ? 'bg-white/20 text-white hover:bg-white/40 shadow-sm border border-white/20 hover:scale-105'
                                : 'text-white/30 cursor-not-allowed'
                                }`}
                            onClick={(e) => !hasEntries && e.preventDefault()}
                            aria-disabled={!hasEntries}
                        >
                            {letter}
                        </a>
                    );
                })}
            </aside>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-6 sm:pt-24 md:pt-32 pb-6 sm:pb-8 md:px-12 md:pb-12 md:max-w-6xl mx-auto scroll-smooth">
                <header className="mb-8 sm:mb-12 text-center md:text-left">
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white drop-shadow-md mb-3">Cultural Glossary</h2>
                    <p className="text-white/80 text-base sm:text-lg max-w-2xl font-medium">
                        A curated dictionary of historical terms, concepts, and cultural artefacts from across India.
                    </p>
                </header>

                <div className="space-y-12 sm:space-y-16 pb-20">
                    {groupedGlossary.map(([letter, terms]) => (
                        <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white drop-shadow-sm select-none">
                                    {letter}
                                </h3>
                                <div className="h-1 sm:h-1.5 rounded-full flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {terms.map((item, idx) => (
                                    <article
                                        key={idx}
                                        className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 focus-within:ring-2 focus-within:ring-white/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent hover:-translate-y-0.5 flex flex-col h-full card-hover"
                                        tabIndex={0}
                                    >
                                        <div className="flex flex-col mb-3 sm:mb-4">
                                            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-sm transition-colors">{item.term}</h4>
                                            <div className="h-0.5 sm:h-1 w-10 sm:w-12 bg-white/50 rounded-full mt-2 sm:mt-3 opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
                                        </div>
                                        <p className="text-white/80 leading-relaxed font-sans font-medium flex-1 text-sm sm:text-base">{item.definition}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <style>{`
        html { scroll-behavior: smooth; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default GlossaryPage;

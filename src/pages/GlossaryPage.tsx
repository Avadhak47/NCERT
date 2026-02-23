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
        <div className="w-full h-full overflow-hidden flex flex-col md:flex-row relative bg-gradient-to-b from-slate-50 to-[var(--color-surface-warm)]">
            {/* Sidebar A–Z */}
            <aside className="w-full md:w-24 shrink-0 bg-slate-800/90 md:h-full overflow-x-auto md:overflow-y-auto z-10 p-2 md:py-8 flex md:flex-col gap-1.5 items-center no-scrollbar border-r border-slate-700/50">
                {alphabet.map(letter => {
                    const hasEntries = groupedGlossary.some(([key]) => key === letter);
                    return (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className={`shrink-0 w-8 md:w-10 aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 focus:ring-offset-slate-800 ${hasEntries
                                ? 'bg-slate-700/80 text-slate-200 hover:bg-[var(--color-brand-primary)] hover:text-white hover:scale-105'
                                : 'text-slate-500 cursor-not-allowed'
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
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 md:p-12 md:max-w-6xl mx-auto scroll-smooth">
                <header className="mb-8 sm:mb-12 text-center md:text-left">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-gradient-brand mb-3">Cultural Glossary</h2>
                    <p className="text-slate-600 text-base sm:text-lg max-w-2xl">
                        A curated dictionary of historical terms, concepts, and cultural artefacts from across India.
                    </p>
                </header>

                <div className="space-y-12 sm:space-y-16 pb-20">
                    {groupedGlossary.map(([letter, terms]) => (
                        <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-slate-700 group-hover:text-[var(--color-brand-primary)] transition-colors select-none">
                                    {letter}
                                </h3>
                                <div className="h-1 sm:h-1.5 rounded-full flex-1 bg-gradient-to-r from-[var(--color-brand-primary)]/30 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {terms.map((item, idx) => (
                                    <article
                                        key={idx}
                                        className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] bg-white shadow-md hover:shadow-[0_12px_40px_-12px_rgba(2,132,199,0.2)] border border-slate-100 hover:border-[var(--color-brand-primary)]/30 transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/50 focus-within:ring-offset-2 hover:-translate-y-0.5 flex flex-col h-full card-hover"
                                        tabIndex={0}
                                    >
                                        <div className="flex flex-col mb-3 sm:mb-4">
                                            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-secondary)] transition-colors">{item.term}</h4>
                                            <div className="h-0.5 sm:h-1 w-10 sm:w-12 bg-[var(--color-brand-accent)] rounded-full mt-2 sm:mt-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-slate-600 leading-relaxed font-sans font-medium flex-1 text-sm sm:text-base">{item.definition}</p>
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

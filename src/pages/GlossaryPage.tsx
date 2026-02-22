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
        <div className="w-full h-full overflow-hidden flex flex-col md:flex-row relative">
            {/* Sidebar Quick Jump - A-Z */}
            <aside className="w-full md:w-24 shrink-0 bg-black/40 border-r border-white/10 md:h-full overflow-x-auto md:overflow-y-auto z-10 p-2 md:py-8 flex md:flex-col gap-1 items-center no-scrollbar">
                {alphabet.map(letter => {
                    const hasEntries = groupedGlossary.some(([key]) => key === letter);
                    return (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className={`shrink-0 w-8 md:w-10 aspect-square flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)] ${hasEntries
                                ? 'bg-white/10 hover:bg-[var(--color-accent-cyan)] text-white hover:scale-110 shadow-sm'
                                : 'text-gray-600 cursor-not-allowed hover:bg-transparent'
                                } `}
                            onClick={(e) => !hasEntries && e.preventDefault()}
                            aria-disabled={!hasEntries}
                        >
                            {letter}
                        </a>
                    );
                })}
            </aside>

            {/* Main Glossary Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:p-12 md:max-w-6xl mx-auto scroll-smooth">
                <header className="mb-12 text-center md:text-left">
                    <h2 className="text-5xl md:text-6xl font-serif text-[var(--color-brand-primary)] mb-4 drop-shadow-sm font-black tracking-tight">Cultural Glossary</h2>
                    <p className="text-slate-500 text-lg font-sans max-w-2xl">
                        A curated dictionary of historical terms, concepts, and cultural artefacts from across India.
                    </p>
                </header>

                <div className="space-y-16 pb-20">
                    {groupedGlossary.map(([letter, terms]) => (
                        <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 group">
                            <div className="flex items-center gap-6 mb-8">
                                <h3 className="text-5xl md:text-6xl font-serif font-black text-slate-200 group-hover:text-[var(--color-brand-secondary)] transition-colors select-none">
                                    {letter}
                                </h3>
                                <div className="h-2 rounded-full flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {terms.map((item, idx) => (
                                    <article
                                        key={idx}
                                        className="p-6 md:p-8 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-100 hover:border-[var(--color-brand-secondary)] transition-all duration-300 focus-within:ring-4 focus-within:ring-[var(--color-brand-secondary)]/50 group hover:-translate-y-1 flex flex-col h-full"
                                        tabIndex={0}
                                    >
                                        <div className="flex flex-col mb-4">
                                            <h4 className="text-2xl font-serif font-bold text-[var(--color-brand-primary)] group-hover:text-[var(--color-brand-secondary)] transition-colors">{item.term}</h4>
                                            <div className="h-1 w-12 bg-[var(--color-brand-accent)] rounded-full mt-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="text-slate-600 leading-relaxed font-sans font-medium flex-1">{item.definition}</p>
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

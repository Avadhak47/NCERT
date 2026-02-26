import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, X, Sparkles } from 'lucide-react';
import glossaryData from '../data/glossary.json';

type TermEntry = { term: string; definition: string };

const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
    }),
};

const cardItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
};

const letterSection = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
};

const GlossaryPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const groupedGlossary = useMemo(() => {
        const map = new Map<string, TermEntry[]>();
        glossaryData.terms.forEach((item: TermEntry) => {
            const letter = item.term.charAt(0).toUpperCase();
            if (!map.has(letter)) map.set(letter, []);
            map.get(letter)!.push(item);
        });
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, []);

    const filteredGrouped = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return groupedGlossary;
        const result: [string, TermEntry[]][] = [];
        groupedGlossary.forEach(([letter, terms]) => {
            const filtered = terms.filter(
                (t) =>
                    t.term.toLowerCase().includes(q) ||
                    t.definition.toLowerCase().includes(q)
            );
            if (filtered.length) result.push([letter, filtered]);
        });
        return result;
    }, [groupedGlossary, searchQuery]);

    const totalTerms = useMemo(
        () => filteredGrouped.reduce((acc, [, terms]) => acc + terms.length, 0),
        [filteredGrouped]
    );

    const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    return (
        <div className="w-full h-full overflow-hidden flex flex-col md:flex-row relative">
            {/* Ambient gradient background */}
            <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-slate-50 via-[var(--color-surface-warm)] via-40% to-amber-50/40 z-0" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(2,132,199,0.08),transparent)] z-0" />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_80%,rgba(251,191,36,0.06),transparent)] z-0" />

            {/* A–Z sidebar */}
            <aside className="relative z-10 w-full md:w-28 shrink-0 md:h-full overflow-x-auto md:overflow-y-auto p-2 md:py-10 flex md:flex-col gap-2 items-center no-scrollbar border-r border-slate-700/40 bg-slate-900/98 backdrop-blur-sm shadow-xl shadow-slate-900/10">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-950/5 via-transparent to-slate-800/20 pointer-events-none" />
                {alphabet.map((letter, i) => {
                    const hasEntries = filteredGrouped.some(([key]) => key === letter);
                    return (
                        <motion.a
                            key={letter}
                            href={hasEntries ? `#letter-${letter}` : undefined}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.012, duration: 0.2 }}
                            className={`relative shrink-0 w-9 md:w-11 aspect-square flex items-center justify-center rounded-2xl font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                hasEntries
                                    ? 'bg-slate-700/70 text-slate-200 hover:bg-gradient-to-br hover:from-[var(--color-brand-primary)] hover:to-sky-600 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-sky-500/20'
                                    : 'text-slate-600 cursor-default pointer-events-none'
                            }`}
                            onClick={(e) => !hasEntries && e.preventDefault()}
                            aria-disabled={!hasEntries}
                        >
                            {letter}
                        </motion.a>
                    );
                })}
            </aside>

            {/* Main content */}
            <div className="relative z-10 flex-1 overflow-y-auto min-h-0 flex flex-col">
                {/* Sticky header: title left, search right */}
                <motion.header
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-20 border-b border-slate-200/50 bg-slate-50/90 md:bg-[var(--color-surface-warm)]/90 backdrop-blur-md shadow-sm px-4 sm:px-6 md:px-12 pt-5 pb-4 md:pt-6 md:pb-5"
                >
                    <div className="w-full flex flex-row items-center justify-between gap-3 sm:gap-6 min-w-0">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-sky-600 text-white shadow-lg shadow-sky-500/25 ring-2 ring-white/50"
                            >
                                <Book className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={2} />
                            </motion.div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-tight truncate">
                                    Cultural Glossary
                                </h1>
                                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 truncate">
                                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span className="truncate">Terms & artefacts from India</span>
                                </p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative shrink-0 w-44 sm:w-56 md:w-72 lg:w-80 min-w-0"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search…"
                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 rounded-2xl border border-slate-200/90 bg-white/95 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40 focus:border-[var(--color-brand-primary)] focus:shadow-[0_0_0_3px_rgba(2,132,199,0.12)] transition-all duration-200 text-sm sm:text-base"
                                aria-label="Search glossary"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        type="button"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    <AnimatePresence>
                        {searchQuery.trim() && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mt-2 text-sm text-slate-500 text-right"
                            >
                                {totalTerms === 0
                                    ? 'No matches'
                                    : `${totalTerms} term${totalTerms !== 1 ? 's' : ''} found`}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.header>

                <div className="flex-1 px-4 sm:px-6 md:px-12 py-8 md:py-10 md:max-w-6xl md:mx-auto w-full scroll-smooth">
                    <AnimatePresence mode="wait">
                        {filteredGrouped.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex flex-col items-center justify-center py-24 text-center px-4"
                            >
                                <motion.div
                                    initial={{ y: 8, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-8 shadow-inner border border-slate-200/60"
                                >
                                    <Search className="w-12 h-12 text-slate-400" />
                                </motion.div>
                                <h2 className="text-2xl font-serif font-bold text-slate-700 mb-3">
                                    No terms match your search
                                </h2>
                                <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
                                    Try a different word or clear the search to browse all terms by letter.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                                >
                                    Clear search
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                className="space-y-14 sm:space-y-20 pb-24"
                                variants={container}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredGrouped.map(([letter, terms], sectionIndex) => (
                                    <motion.section
                                        key={letter}
                                        id={`letter-${letter}`}
                                        variants={letterSection}
                                        className="scroll-mt-36 group"
                                    >
                                        {/* Letter header with decorative background letter */}
                                        <div className="relative flex items-center gap-5 sm:gap-6 mb-8 min-h-[5.5rem] overflow-hidden">
                                            <span
                                                className="absolute left-0 font-serif font-black text-[7rem] sm:text-[8rem] text-slate-100 select-none pointer-events-none leading-none -translate-y-1/2 top-1/2 drop-shadow-sm"
                                                aria-hidden
                                            >
                                                {letter}
                                            </span>
                                            <h2 className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-700 group-hover:text-[var(--color-brand-primary)] transition-colors duration-300 drop-shadow-sm">
                                                {letter}
                                            </h2>
                                            <div className="relative z-10 h-1.5 rounded-full flex-1 max-w-md bg-gradient-to-r from-[var(--color-brand-primary)]/50 via-amber-400/40 to-transparent shadow-sm" />
                                        </div>

                                        <motion.div
                                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
                                            variants={container}
                                        >
                                            {terms.map((item, idx) => (
                                                <motion.article
                                                    key={`${letter}-${idx}`}
                                                    variants={cardItem}
                                                    transition={{ duration: 0.25 }}
                                                    className="group/card relative p-6 sm:p-7 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_12px_24px_-8px_rgba(2,132,199,0.15)] border border-slate-100/90 hover:border-[var(--color-brand-primary)]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col focus-within:ring-2 focus-within:ring-[var(--color-brand-primary)]/30 focus-within:ring-offset-2 overflow-hidden"
                                                    tabIndex={0}
                                                >
                                                    {/* Accent bar */}
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--color-brand-primary)] to-sky-500 opacity-90 group-hover/card:opacity-100 transition-opacity rounded-l-2xl"
                                                        aria-hidden
                                                    />
                                                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-brand-primary)] mb-2 pl-1">
                                                        {item.term}
                                                    </h3>
                                                    <div className="h-0.5 w-12 bg-gradient-to-r from-[var(--color-brand-accent)]/70 to-transparent rounded-full mb-4 opacity-80" />
                                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base flex-1 pl-0.5">
                                                        {item.definition}
                                                    </p>
                                                </motion.article>
                                            ))}
                                        </motion.div>
                                    </motion.section>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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

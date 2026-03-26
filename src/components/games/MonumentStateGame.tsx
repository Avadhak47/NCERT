import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Landmark, CheckCircle, XCircle } from 'lucide-react';
import statesData from '../../data/states.json';
import { shuffle, pickRandom } from '../../utils/gameUtils';

type OnBackFn = (score?: string) => void;

interface MonumentStateGameProps {
    onBack: OnBackFn;
}

function getHeritageDisplayName(monumentName: string, stateName: string): string {
    let name = monumentName.trim();
    const state = stateName.trim();
    if (!state) return name;
    const patterns = [
        new RegExp(`,\\s*${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'),
        new RegExp(`\\s*\\(${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*$`, 'i'),
        new RegExp(`\\s*—\\s*${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'),
    ];
    for (const re of patterns) {
        name = name.replace(re, '').trim();
    }
    return name || monumentName;
}

const MonumentStateGame: React.FC<MonumentStateGameProps> = ({ onBack }) => {
    const items = useMemo(() => {
        const list: { stateName: string; monumentName: string; monumentImg?: string }[] = [];
        statesData.states.forEach(s => {
            (s.monuments || []).forEach((m: { name?: string; img?: string }) => {
                if (m.name) list.push({ stateName: s.name, monumentName: m.name, monumentImg: m.img });
            });
        });
        return list;
    }, []);

    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<string | null>(null);
    const [rounds] = useState(() => pickRandom(items, Math.min(10, items.length)));

    const current = rounds[round];
    const heritageDisplayName = current ? getHeritageDisplayName(current.monumentName, current.stateName) : '';
    const stateOptions = useMemo(() => {
        if (!current) return [];
        const wrong = statesData.states.map(s => s.name).filter(n => n !== current.stateName);
        return shuffle([current.stateName, ...pickRandom(wrong, 3)]);
    }, [current]);

    if (!current || stateOptions.length < 4) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-black/60 mb-6 font-bold">Incomplete heritage data.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-black font-black">← Back</button>
            </div>
        );
    }

    const handleAnswer = (state: string) => {
        if (answered) return;
        setAnswered(state);
        if (state === current.stateName) setScore(s => s + 1);
    };

    const next = () => {
        setAnswered(null);
        setRound(r => r + 1);
    };
    const isDone = round >= rounds.length - 1 && answered !== null;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-sm">
                        <Landmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <span className="text-black font-black text-lg">{score} <span className="text-sm opacity-50">/ {rounds.length}</span></span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 opacity-60">Heritage Points</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {rounds.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i < round ? 'w-4 bg-amber-400' : i === round ? 'w-8 bg-amber-600' : 'w-4 bg-black/10'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <motion.div 
                key={round}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[3rem] overflow-hidden border border-white/60 bg-white/40 backdrop-blur-3xl shadow-2xl mb-10 relative group"
            >
                {current.monumentImg ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <motion.img 
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.2 }}
                            src={current.monumentImg} 
                            alt="" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-90" />
                        <div className="absolute bottom-10 left-10">
                            <span className="text-amber-200 text-xs font-black uppercase tracking-[0.3em] mb-2 block">National Heritage</span>
                            <h3 className="text-4xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-2xl">{heritageDisplayName}</h3>
                        </div>
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center text-center">
                        <span className="text-amber-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Historical Site</span>
                        <h3 className="text-5xl font-serif font-black text-black leading-tight mb-4">{heritageDisplayName}</h3>
                        <div className="w-20 h-1 bg-amber-200 rounded-full" />
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stateOptions.map(state => {
                    const isCorrect = state === current.stateName;
                    const chosen = answered === state;
                    const showRight = answered !== null;
                    return (
                        <motion.button
                            key={state}
                            whileHover={!showRight ? { scale: 1.02, y: -4 } : {}}
                            whileTap={!showRight ? { scale: 0.98 } : {}}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(state)}
                            className={`p-6 rounded-3xl border-2 text-left font-black transition-all duration-300 flex items-center gap-4 group shadow-sm ${
                                showRight && chosen
                                    ? isCorrect
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/40'
                                        : 'bg-red-500 border-red-500 text-white shadow-red-500/40'
                                    : showRight && isCorrect
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                        : 'bg-white/60 backdrop-blur-xl border-white/60 text-black hover:border-amber-300'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                showRight && chosen ? 'bg-white/30 border-white' : 'bg-black/5 border-black/10 group-hover:border-amber-400'
                            }`}>
                                {showRight && (isCorrect ? <CheckCircle className="w-5 h-5 text-white" /> : (chosen ? <XCircle className="w-5 h-5 text-white" /> : null))}
                            </div>
                            <span className="flex-1 text-lg">{state}</span>
                        </motion.button>
                    );
                })}
            </div>

            {answered !== null && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${answered === current.stateName ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {answered === current.stateName ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                        </div>
                        <div>
                            <h4 className="font-black text-black">{answered === current.stateName ? 'Architecture Expert!' : 'Keep Exploring'}</h4>
                            <p className="text-black/60 text-sm font-bold uppercase tracking-widest text-[10px]">Located in the state of <span className="text-amber-600">{current.stateName}</span></p>
                        </div>
                    </div>
                    {!isDone ? (
                        <button onClick={next} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black text-white font-black hover:bg-slate-800 shadow-xl">Next Site</button>
                    ) : (
                        <button onClick={() => onBack(`${score}/${rounds.length}`)} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[var(--color-brand-primary)] text-white font-black shadow-xl">Finish Tour</button>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default MonumentStateGame;

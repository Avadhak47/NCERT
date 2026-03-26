import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trophy, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { REGIONS, REGION_TO_STATES, STATE_TO_REGION } from '../../constants/regions';
import { shuffle } from '../../utils/gameUtils';

const REGION_STYLES: Record<string, { bg: string; border: string; label: string }> = {
    North: { bg: 'bg-sky-50', border: 'border-sky-200', label: 'text-sky-800' },
    South: { bg: 'bg-violet-50', border: 'border-violet-200', label: 'text-violet-800' },
    East: { bg: 'bg-teal-50', border: 'border-teal-200', label: 'text-teal-800' },
    West: { bg: 'bg-amber-50', border: 'border-amber-200', label: 'text-amber-800' },
    Central: { bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'text-emerald-800' },
    Northeast: { bg: 'bg-rose-50', border: 'border-rose-200', label: 'text-rose-800' },
};

type OnBackFn = (score?: string) => void;

interface StateToRegionGameProps {
    onBack: OnBackFn;
}

const StateToRegionGame: React.FC<StateToRegionGameProps> = ({ onBack }) => {
    const allStates = useMemo(() => {
        const list: string[] = [];
        REGIONS.forEach(r => { (REGION_TO_STATES[r] || []).forEach(s => list.push(s)); });
        return shuffle(list);
    }, []);

    const [remaining, setRemaining] = useState<string[]>(() => [...allStates]);
    const [placed, setPlaced] = useState<Record<string, { state: string; correct: boolean }[]>>(() =>
        Object.fromEntries(REGIONS.map(r => [r, []]))
    );
    const [draggedState, setDraggedState] = useState<string | null>(null);
    const [dragOverRegion, setDragOverRegion] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const score = useMemo(() => {
        let n = 0;
        Object.entries(placed).forEach(([, states]) => {
            states.forEach(({ correct }) => { if (correct) n++; });
        });
        return n;
    }, [placed]);

    const placeState = (state: string, region: string) => {
        if (!remaining.includes(state)) return;
        const correct = STATE_TO_REGION[state] === region;
        setRemaining(prev => prev.filter(s => s !== state));
        setPlaced(prev => ({
            ...prev,
            [region]: [...(prev[region] || []), { state, correct }]
        }));
        setSelectedState(null);
    };

    const handleDragStart = (e: React.DragEvent, state: string) => {
        setDraggedState(state);
        setSelectedState(null);
        e.dataTransfer.setData('text/plain', state);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, region: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverRegion(region);
    };

    const handleDragLeave = () => setDragOverRegion(null);

    const handleDrop = (e: React.DragEvent, region: string) => {
        e.preventDefault();
        setDragOverRegion(null);
        const state = e.dataTransfer.getData('text/plain') || draggedState;
        if (state) placeState(state, region);
        setDraggedState(null);
    };

    const handleDragEnd = () => {
        setDraggedState(null);
        setDragOverRegion(null);
    };

    const handleRegionClick = (region: string) => {
        if (selectedState) placeState(selectedState, region);
    };

    useEffect(() => {
        if (remaining.length === 0 && allStates.length > 0) setDone(true);
    }, [remaining.length, allStates.length]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-4">
                    <p className="text-black text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">Geographical Zones</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {REGIONS.map(region => {
                            const isDragOver = dragOverRegion === region;
                            const isClickTarget = selectedState !== null;
                            const style = REGION_STYLES[region];
                            const regionPlaced = placed[region] || [];
                            return (
                                <motion.div
                                    key={region}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleRegionClick(region)}
                                    onDragOver={(e: React.DragEvent) => handleDragOver(e, region)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e: React.DragEvent) => handleDrop(e, region)}
                                    className={`min-h-[160px] rounded-[2.5rem] border-2 p-6 transition-all duration-300 relative overflow-hidden group ${
                                        isDragOver ? 'border-amber-400 bg-amber-50/50 scale-[1.02] shadow-2xl' : `${style.bg} ${style.border} shadow-lg`
                                    } ${isClickTarget ? 'hover:border-amber-300 hover:bg-amber-50/20' : ''}`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center">
                                                <Map className="w-5 h-5 text-black" />
                                            </div>
                                            <span className={`font-serif font-black text-xl ${style.label}`}>{region}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${style.label}`}>
                                            {regionPlaced.length} states
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {regionPlaced.map(({ state, correct }) => (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                key={state}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
                                                    correct ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' : 'bg-red-500 border-red-400 text-white shadow-md'
                                                }`}
                                            >
                                                {correct ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {state}
                                            </motion.span>
                                        ))}
                                    </div>
                                    {isDragOver && <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none" />}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full lg:w-80 space-y-6">
                    <div className="p-6 rounded-[2.5rem] bg-black text-white shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-3xl font-black">{score}</span>
                            <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy Quest</p>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <motion.div 
                                className="h-full bg-amber-400" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / allStates.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-6 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl overflow-y-auto max-h-[500px]">
                        <p className="text-black text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-40">Ready to place</p>
                        <div className="space-y-3">
                            {remaining.map(state => {
                                const isSelected = selectedState === state;
                                return (
                                    <div
                                        key={state}
                                        draggable
                                        onDragStart={(e: React.DragEvent) => handleDragStart(e, state)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedState(prev => (prev === state ? null : state))}
                                        className={`px-5 py-3.5 rounded-2xl font-black text-sm tracking-tight border-2 cursor-grab active:cursor-grabbing transition-all select-none shadow-sm flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-amber-400 border-amber-500 text-black'
                                                : 'bg-white/80 backdrop-blur-md text-black border-white/60 hover:border-black/20'
                                        }`}
                                    >
                                        <span>{state}</span>
                                        <ArrowLeft className="w-4 h-4 opacity-20 rotate-180" />
                                    </div>
                                );
                            })}
                        </div>
                        {remaining.length === 0 && (
                            <div className="text-center py-10 opacity-30">
                                <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-xs font-black uppercase tracking-widest">All categorized</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {done && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 text-center p-12 rounded-[3.5rem] bg-white/60 backdrop-blur-3xl border border-white/60 shadow-2xl"
                    >
                        <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
                        <h3 className="text-4xl font-serif font-black text-black mb-2 tracking-tight">Cartographer Master!</h3>
                        <p className="text-black/60 text-sm font-black uppercase tracking-widest mb-10">You matched {score} out of {allStates.length} states to their correct zones</p>
                        <button onClick={() => onBack(`${score}/${allStates.length}`)} className="px-12 py-4 rounded-2xl bg-black text-white font-black hover:bg-slate-800 transition-all shadow-xl hover:scale-105 active:scale-95">Claim Certificate</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StateToRegionGame;

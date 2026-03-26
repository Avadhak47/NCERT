import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import statesData from '../../data/states.json';
import { shuffle, pickRandom } from '../../utils/gameUtils';

type OnBackFn = (score?: string) => void;

interface HeritageSiteBuilderGameProps {
    onBack: OnBackFn;
}

const HeritageSiteBuilderGame: React.FC<HeritageSiteBuilderGameProps> = ({ onBack }) => {
    const monumentsWithImg = useMemo(() => {
        const list: { name: string; img: string; stateName: string }[] = [];
        statesData.states.forEach(s => {
            (s.monuments || []).forEach((m: { name?: string; img?: string }) => {
                if (m.name && m.img && m.img.trim()) list.push({ name: m.name, img: m.img, stateName: s.name });
            });
        });
        return list;
    }, []);

    const [monument] = useState(() => pickRandom(monumentsWithImg, 1)[0]);
    const [cells, setCells] = useState<number[]>(() => shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]));
    const [selected, setSelected] = useState<number | null>(null);

    const solved = cells.every((val, i) => val === i);

    const handleCellClick = (index: number) => {
        if (selected === null) {
            setSelected(index);
            return;
        }
        if (selected === index) {
            setSelected(null);
            return;
        }
        setCells(prev => {
            const next = [...prev];
            [next[selected], next[index]] = [next[index], next[selected]];
            return next;
        });
        setSelected(null);
    };

    const getBackgroundPosition = (pieceIndex: number) => {
        const col = pieceIndex % 3;
        const row = Math.floor(pieceIndex / 3);
        return `${col * 50}% ${row * 50}%`;
    };

    if (!monument) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-slate-600 mb-6">No monument images available for the puzzle.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">← Back</button>
            </div>
        );
    }

    if (solved) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-700">
                <div className="rounded-[2.5rem] overflow-hidden border-4 border-[var(--color-brand-primary)]/20 shadow-2xl mb-8">
                    <img src={monument.img} alt={monument.name} className="w-full aspect-video object-cover" />
                </div>
                <Trophy className="w-12 h-12 text-[var(--color-brand-primary)] mx-auto mb-4" />
                <p className="text-3xl font-black text-black mb-2 tracking-tight">Master Builder!</p>
                <p className="text-black text-sm mb-8 font-black uppercase tracking-widest opacity-60">You successfully restored <span className="text-[var(--color-brand-primary)]">{monument.name}</span></p>
                <button onClick={() => onBack('1/1')} className="px-10 py-4 rounded-2xl bg-[var(--color-brand-primary)] text-white font-black shadow-xl shadow-[var(--color-brand-primary)]/20 transition-all hover:scale-105 active:scale-95">Claim Certificate</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="text-center mb-10">
                <span className="px-4 py-1.5 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-black border border-white/50 shadow-sm mb-4 inline-block">Architecture Puzzle</span>
                <h3 className="text-2xl font-serif font-black text-black tracking-tight">{monument.name}</h3>
                <p className="text-black/50 text-[10px] font-black uppercase tracking-widest mt-1">{monument.stateName}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 rounded-[2.5rem] overflow-hidden border border-white/60 bg-white/30 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 aspect-square">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.02, zIndex: 10 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => handleCellClick(index)}
                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 relative ${
                            selected === index ? 'border-[var(--color-brand-primary)] ring-4 ring-[var(--color-brand-primary)]/40 shadow-2xl' : 'border-white/40 hover:border-white shadow-sm'
                        }`}
                    >
                        <div
                            className="w-full h-full bg-slate-100 bg-cover bg-no-repeat"
                            style={{
                                backgroundImage: `url(${monument.img})`,
                                backgroundSize: '300% 300%',
                                backgroundPosition: getBackgroundPosition(cells[index]),
                            }}
                        />
                        {selected === index && <div className="absolute inset-0 bg-[var(--color-brand-primary)]/10 animate-pulse pointer-events-none" />}
                    </motion.button>
                ))}
            </div>
            <p className="text-black text-[10px] font-black text-center mt-10 uppercase tracking-[0.2em] opacity-40">Tap pieces to swap and arrange</p>
        </div>
    );
};

export default HeritageSiteBuilderGame;

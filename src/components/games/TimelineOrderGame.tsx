import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import timelineData from '../../data/timeline.json';
import { shuffle } from '../../utils/gameUtils';

type OnBackFn = (score?: string) => void;

interface TimelineOrderGameProps {
    onBack: OnBackFn;
}

const TimelineOrderGame: React.FC<TimelineOrderGameProps> = ({ onBack }) => {
    const periods = useMemo(() => timelineData.periods.map((p, i) => ({ ...p, correctIndex: i })), []);
    const [order, setOrder] = useState<typeof periods>(() => shuffle([...periods]));
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const move = (index: number, dir: 1 | -1) => {
        if (submitted) return;
        const next = index + dir;
        if (next < 0 || next >= order.length) return;
        const arr = [...order];
        [arr[index], arr[next]] = [arr[next], arr[index]];
        setOrder(arr);
    };

    const handleSubmit = () => {
        const correct = order.filter((p, i) => p.correctIndex === i).length;
        setScore(correct);
        setSubmitted(true);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <p className="text-slate-700 text-center mb-2 font-medium">Arrange the periods from oldest to most recent</p>
            <p className="text-slate-500 text-sm text-center mb-6">Use the arrows to move each period up or down</p>

            <div className="relative mb-8">
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 rounded-full" />

                <ul className="space-y-4 relative">
                    {order.map((p, i) => {
                        const isCorrect = submitted && p.correctIndex === i;
                        const isWrong = submitted && p.correctIndex !== i;
                        return (
                            <li key={p.id} className="relative flex items-center gap-4">
                                <div
                                    className="relative z-10 w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white/50"
                                    style={{ backgroundColor: p.color }}
                                >
                                    {i + 1}
                                </div>
                                <div
                                    className={`flex-1 flex items-center justify-between gap-4 py-3 px-5 rounded-2xl border-2 transition-all duration-200 ${
                                        isCorrect
                                            ? 'bg-emerald-500/20 border-emerald-400 shadow-sm'
                                            : isWrong
                                                ? 'bg-red-500/20 border-red-400 shadow-sm'
                                                : 'bg-white/40 backdrop-blur-md border-white/50 hover:border-white hover:bg-white/60 shadow-md'
                                    }`}
                                >
                                    <span className="font-black text-black text-lg tracking-tight">{p.name}</span>
                                    {!submitted && (
                                        <span className="flex gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => move(i, -1)}
                                                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 transition-all"
                                                aria-label="Move up"
                                            >
                                                <span className="text-lg leading-none">↑</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(i, 1)}
                                                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 transition-all"
                                                aria-label="Move down"
                                            >
                                                <span className="text-lg leading-none">↓</span>
                                            </button>
                                        </span>
                                    )}
                                    {submitted && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />}
                                    {submitted && isWrong && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {!submitted ? (
                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3.5 rounded-2xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white font-bold shadow-lg shadow-[var(--color-brand-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Check order
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-2xl font-black text-black mb-2">Score: {score} / {periods.length} correct</p>
                    <p className="text-black text-sm mb-6 font-bold uppercase tracking-widest text-[10px]">Chronological order of Indian history periods</p>
                    <button
                        onClick={() => onBack(`${score}/${periods.length}`)}
                        className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white/60 border border-white/50 text-slate-800 font-medium transition-colors"
                    >
                        ← Back to Arcade
                    </button>
                </div>
            )}
        </div>
    );
};

export default TimelineOrderGame;

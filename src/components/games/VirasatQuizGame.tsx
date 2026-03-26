import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import quizData from '../../data/quiz.json';
import { pickRandom } from '../../utils/gameUtils';

type OnBackFn = (score?: string) => void;

interface VirasatQuizGameProps {
    onBack: OnBackFn;
}

const VirasatQuizGame: React.FC<VirasatQuizGameProps> = ({ onBack }) => {
    const [roundOptions] = useState(() => pickRandom(quizData.questions, Math.min(10, quizData.questions.length)));
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<number | null>(null);

    const current = roundOptions[round];

    if (!current) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-black/60 mb-6 font-bold">Incomplete quiz data.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-black font-black">← Back</button>
            </div>
        );
    }

    const handleAnswer = (index: number) => {
        if (answered !== null) return;
        setAnswered(index);
        if (index === current.answer) setScore((s) => s + 1);
    };

    const next = () => {
        setAnswered(null);
        setRound((r) => r + 1);
    };

    const isDone = round >= roundOptions.length - 1 && answered !== null;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200 shadow-sm">
                        <Award className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <span className="text-black font-black text-lg">{score} <span className="text-sm opacity-50">/ {roundOptions.length}</span></span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 opacity-60">Knowledge Mastery</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {roundOptions.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i < round ? 'w-4 bg-rose-400' : i === round ? 'w-8 bg-rose-600' : 'w-4 bg-black/10'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <motion.div 
                key={round}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[3rem] p-10 md:p-16 border border-white/60 bg-white/40 backdrop-blur-3xl shadow-2xl mb-10 relative overflow-hidden group text-center"
            >
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-violet-500" />
                <span className="px-5 py-2 bg-rose-50 rounded-full text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block border border-rose-100">
                    {current.category?.toLowerCase().startsWith('answer:') ? 'General Awareness' : (current.category || 'General Awareness')}
                </span>
                <h3 className="text-3xl md:text-4xl font-serif font-black text-black leading-tight tracking-tight">{current.question}</h3>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.options.map((opt: string, index: number) => {
                    const isCorrect = index === current.answer;
                    const chosen = answered === index;
                    const showRight = answered !== null;
                    return (
                        <motion.button
                            key={index}
                            whileHover={!showRight ? { scale: 1.02, y: -4 } : {}}
                            whileTap={!showRight ? { scale: 0.98 } : {}}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(index)}
                            className={`p-6 rounded-3xl border-2 text-left font-black transition-all duration-300 flex items-center gap-4 group shadow-sm ${
                                showRight && chosen
                                    ? isCorrect
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/40'
                                        : 'bg-red-500 border-red-500 text-white shadow-red-500/40'
                                    : showRight && isCorrect
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                        : 'bg-white/60 backdrop-blur-xl border-white/60 text-black hover:border-rose-300'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                showRight && chosen ? 'bg-white/30 border-white' : 'bg-black/5 border-black/10 group-hover:border-rose-400'
                            }`}>
                                <span className={showRight && chosen ? 'text-white' : 'opacity-40'}>{['A', 'B', 'C', 'D'][index]}</span>
                            </div>
                            <span className="flex-1 text-lg leading-tight">{opt}</span>
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence>
                {isDone ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-12 text-center p-12 rounded-[3.5rem] bg-white/60 backdrop-blur-3xl border border-white/60 shadow-2xl"
                    >
                        <Award className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                        <h3 className="text-4xl font-serif font-black text-black mb-2 tracking-tight">Virasat Scholar!</h3>
                        <p className="text-black/60 text-sm font-black uppercase tracking-widest mb-10">You mastered {score} out of {roundOptions.length} cultural challenges</p>
                        <button onClick={() => onBack(`${score}/${roundOptions.length}`)} className="px-12 py-4 rounded-2xl bg-black text-white font-black hover:bg-slate-800 transition-all shadow-xl hover:scale-105 active:scale-95">Claim Certificate</button>
                    </motion.div>
                ) : (
                    answered !== null && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-10 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-3xl border border-white/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${answered === current.answer ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {answered === current.answer ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                                </div>
                                <div>
                                    <h4 className="font-black text-black">{answered === current.answer ? 'Absolute Genius!' : 'Learning is Growth'}</h4>
                                    <p className="text-black/60 text-sm font-bold uppercase tracking-widest text-[10px]">The correct answer was <span className="text-rose-600">{current.options[current.answer]}</span></p>
                                </div>
                            </div>
                            <button onClick={next} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black text-white font-black hover:bg-slate-800 shadow-xl">Next Challenge</button>
                        </motion.div>
                    )
                )}
            </AnimatePresence>
        </div>
    );
};

export default VirasatQuizGame;

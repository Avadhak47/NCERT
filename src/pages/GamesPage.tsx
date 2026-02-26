import { useState, useMemo, useEffect } from 'react';
import { PlayCircle, Trophy, Star, ArrowLeft, CheckCircle, XCircle, MapPin, Landmark, Music, Clock, Map, Puzzle } from 'lucide-react';
import gamesData from '../data/games.json';
import statesData from '../data/states.json';
import timelineData from '../data/timeline.json';
import { REGIONS, REGION_TO_STATES, STATE_TO_REGION } from '../constants/regions';

function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function pickRandom<T>(arr: T[], n: number): T[] {
    const s = shuffle(arr);
    return s.slice(0, Math.min(n, arr.length));
}

// --- State Capital Match (id: 1) ---
function StateCapitalGame({ onBack }: { onBack: () => void }) {
    const stateCapitals = useMemo(() => {
        return statesData.states
            .filter(s => s.geography?.capital)
            .map(s => ({ state: s.name, capital: s.geography!.capital! }));
    }, []);

    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<string | null>(null);
    const [rounds] = useState(() => pickRandom(stateCapitals, Math.min(10, stateCapitals.length)));

    const current = rounds[round];
    const options = useMemo(() => {
        if (!current) return [];
        const wrong = stateCapitals.filter(c => c.capital !== current.capital).map(c => c.capital);
        return shuffle([current.capital, ...pickRandom(wrong, 3)]);
    }, [current, stateCapitals]);

    if (!current) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">Not enough state data to play.</p>
                <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
            </div>
        );
    }

    const handleAnswer = (cap: string) => {
        if (answered) return;
        setAnswered(cap);
        if (cap === current.capital) setScore(s => s + 1);
    };

    const next = () => {
        setAnswered(null);
        setRound(r => r + 1);
    };

    const isDone = round >= rounds.length - 1 && answered !== null;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <span className="text-white/80 font-bold">Score: {score} / {rounds.length}</span>
                <span className="text-white/60 text-sm">Round {round + 1} of {rounds.length}</span>
            </div>
            <div className="bg-slate-700/50 rounded-2xl p-8 border border-slate-500/50 mb-8">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">What is the capital of...</p>
                <h3 className="text-3xl font-bold text-white">{current.state}?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map(cap => {
                    const isCorrect = cap === current.capital;
                    const chosen = answered === cap;
                    const showRight = answered !== null;
                    let style = 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-white';
                    if (showRight && chosen) style = isCorrect ? 'bg-emerald-600/80 border-emerald-400 text-white' : 'bg-red-600/80 border-red-400 text-white';
                    else if (showRight && isCorrect) style = 'bg-emerald-600/60 border-emerald-400/80 text-white';
                    return (
                        <button
                            key={cap}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(cap)}
                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${style}`}
                        >
                            <span className="flex items-center gap-2">
                                {showRight && chosen && (isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />)}
                                {cap}
                            </span>
                        </button>
                    );
                })}
            </div>
            {answered !== null && !isDone && (
                <div className="mt-8 text-center">
                    <button onClick={next} className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">Next →</button>
                </div>
            )}
            {isDone && (
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {rounds.length}</p>
                    <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Historical Timeline (id: 4) ---
function TimelineOrderGame({ onBack }: { onBack: () => void }) {
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
            <p className="text-white/80 mb-6">Place the periods in chronological order (oldest first). Use arrows to move.</p>
            <ul className="space-y-3 mb-8">
                {order.map((p, i) => (
                    <li
                        key={p.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${submitted ? (p.correctIndex === i ? 'bg-emerald-600/30 border-emerald-400' : 'bg-red-600/20 border-red-400/60') : 'bg-slate-700/50 border-slate-500/50'}`}
                    >
                        <span className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-300 font-mono w-8">{i + 1}.</span>
                        <div className="flex-1">
                            <span className="font-bold text-white">{p.name}</span>
                            <span className="text-white/70 text-sm ml-2">({p.years})</span>
                        </div>
                        {!submitted && (
                            <span className="flex gap-1">
                                <button type="button" onClick={() => move(i, -1)} className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30" aria-label="Move up">↑</button>
                                <button type="button" onClick={() => move(i, 1)} className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30" aria-label="Move down">↓</button>
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {!submitted ? (
                <div className="text-center">
                    <button onClick={handleSubmit} className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">Check order</button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-4">Score: {score} / {periods.length} correct</p>
                    <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Monument & State (id: 5) ---
function MonumentStateGame({ onBack }: { onBack: () => void }) {
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
    const stateOptions = useMemo(() => {
        if (!current) return [];
        const wrong = statesData.states.map(s => s.name).filter(n => n !== current.stateName);
        return shuffle([current.stateName, ...pickRandom(wrong, 3)]);
    }, [current]);

    if (!current || stateOptions.length < 4) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">Not enough monument data to play.</p>
                <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
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
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <span className="text-white/80 font-bold">Score: {score} / {rounds.length}</span>
                <span className="text-white/60 text-sm">Round {round + 1} of {rounds.length}</span>
            </div>
            <div className="bg-slate-700/50 rounded-2xl overflow-hidden border border-slate-500/50 mb-8">
                {current.monumentImg && (
                    <div className="aspect-video w-full max-h-52 bg-slate-800">
                        <img src={current.monumentImg} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Which state is this heritage site in?</p>
                    <h3 className="text-2xl font-bold text-white">{current.monumentName}</h3>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stateOptions.map(state => {
                    const isCorrect = state === current.stateName;
                    const chosen = answered === state;
                    const showRight = answered !== null;
                    let style = 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-white';
                    if (showRight && chosen) style = isCorrect ? 'bg-emerald-600/80 border-emerald-400 text-white' : 'bg-red-600/80 border-red-400 text-white';
                    else if (showRight && isCorrect) style = 'bg-emerald-600/60 border-emerald-400/80 text-white';
                    return (
                        <button
                            key={state}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(state)}
                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${style}`}
                        >
                            <span className="flex items-center gap-2">
                                {showRight && chosen && (isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />)}
                                {state}
                            </span>
                        </button>
                    );
                })}
            </div>
            {answered !== null && !isDone && (
                <div className="mt-8 text-center">
                    <button onClick={next} className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">Next →</button>
                </div>
            )}
            {isDone && (
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {rounds.length}</p>
                    <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Guess the Dance Form (id: 3): dance name → state ---
function DanceStateGame({ onBack }: { onBack: () => void }) {
    const items = useMemo(() => {
        const list: { stateName: string; danceName: string }[] = [];
        statesData.states.forEach(s => {
            (s.art_forms?.performing_arts || []).forEach((a: { name?: string; title?: string }) => {
                const name = a.name || a.title;
                if (name) list.push({ stateName: s.name, danceName: name });
            });
        });
        return list;
    }, []);

    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<string | null>(null);
    const [rounds] = useState(() => pickRandom(items, Math.min(10, items.length)));

    const current = rounds[round];
    const stateOptions = useMemo(() => {
        if (!current) return [];
        const wrong = statesData.states.map(s => s.name).filter(n => n !== current.stateName);
        return shuffle([current.stateName, ...pickRandom(wrong, 3)]);
    }, [current]);

    if (!current || stateOptions.length < 4) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">Not enough dance data to play.</p>
                <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
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
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <span className="text-white/80 font-bold">Score: {score} / {rounds.length}</span>
                <span className="text-white/60 text-sm">Round {round + 1} of {rounds.length}</span>
            </div>
            <div className="bg-slate-700/50 rounded-2xl p-8 border border-slate-500/50 mb-8">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Which state does this dance form belong to?</p>
                <h3 className="text-2xl font-bold text-white">{current.danceName}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stateOptions.map(state => {
                    const isCorrect = state === current.stateName;
                    const chosen = answered === state;
                    const showRight = answered !== null;
                    let style = 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-500/50 text-white';
                    if (showRight && chosen) style = isCorrect ? 'bg-emerald-600/80 border-emerald-400 text-white' : 'bg-red-600/80 border-red-400 text-white';
                    else if (showRight && isCorrect) style = 'bg-emerald-600/60 border-emerald-400/80 text-white';
                    return (
                        <button
                            key={state}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(state)}
                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${style}`}
                        >
                            <span className="flex items-center gap-2">
                                {showRight && chosen && (isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />)}
                                {state}
                            </span>
                        </button>
                    );
                })}
            </div>
            {answered !== null && !isDone && (
                <div className="mt-8 text-center">
                    <button onClick={next} className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold">Next →</button>
                </div>
            )}
            {isDone && (
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {rounds.length}</p>
                    <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- State to Region drag-and-drop (id: 6) ---
const REGION_COLORS: Record<string, string> = {
    North: 'bg-sky-500/20 border-sky-400', South: 'bg-violet-500/20 border-violet-400',
    East: 'bg-teal-500/20 border-teal-400', West: 'bg-amber-500/20 border-amber-400',
    Central: 'bg-emerald-500/20 border-emerald-400', Northeast: 'bg-rose-500/20 border-rose-400',
};

function StateToRegionGame({ onBack }: { onBack: () => void }) {
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
    const [done, setDone] = useState(false);

    const score = useMemo(() => {
        let n = 0;
        Object.entries(placed).forEach(([, states]) => {
            states.forEach(({ correct }) => { if (correct) n++; });
        });
        return n;
    }, [placed]);

    const handleDragStart = (e: React.DragEvent, state: string) => {
        setDraggedState(state);
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
        if (!state || !remaining.includes(state)) return;
        const correct = STATE_TO_REGION[state] === region;
        setRemaining(prev => prev.filter(s => s !== state));
        setPlaced(prev => ({
            ...prev,
            [region]: [...(prev[region] || []), { state, correct }],
        }));
        setDraggedState(null);
    };

    const handleDragEnd = () => {
        setDraggedState(null);
        setDragOverRegion(null);
    };

    useEffect(() => {
        if (remaining.length === 0) setDone(true);
    }, [remaining.length]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <p className="text-slate-200 mb-6">Drag each state name into the correct region bucket.</p>
            <div className="flex justify-between items-center mb-6">
                <span className="text-white font-bold">Score: {score} / {allStates.length}</span>
                <span className="text-slate-300 text-sm">{remaining.length} left to place</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {REGIONS.map(region => (
                    <div
                        key={region}
                        onDragOver={(e) => handleDragOver(e, region)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, region)}
                        className={`min-h-[120px] rounded-2xl border-2 border-dashed p-4 transition-colors ${dragOverRegion === region ? 'ring-2 ring-white scale-[1.02]' : ''} ${REGION_COLORS[region] || 'bg-white/10 border-white/30'}`}
                    >
                        <div className="font-bold text-white mb-3 flex items-center gap-2">
                            <Map className="w-4 h-4" /> {region}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(placed[region] || []).map(({ state, correct }) => (
                                <span
                                    key={state}
                                    className={`px-2 py-1 rounded-lg text-sm font-medium ${correct ? 'bg-emerald-600/80 text-white' : 'bg-red-600/80 text-white'}`}
                                >
                                    {state}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-3">
                {remaining.map(state => (
                    <div
                        key={state}
                        draggable
                        onDragStart={(e) => handleDragStart(e, state)}
                        onDragEnd={handleDragEnd}
                        className="px-4 py-2 rounded-xl bg-white/90 text-slate-800 font-medium cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg hover:scale-105 transition-transform border-2 border-white"
                    >
                        {state}
                    </div>
                ))}
            </div>
            {done && (
                <div className="mt-10 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {allStates.length}</p>
                    <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Placeholder for Puzzle / coming soon (id: 2) ---
function PlaceholderGame({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="w-full max-w-2xl mx-auto text-center py-12">
            <Star className="w-16 h-16 text-[var(--color-accent-amber)] mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/70 mb-8">This game is coming soon. Stay tuned!</p>
            <button onClick={onBack} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Arcade
            </button>
        </div>
    );
}

const GAME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    MapPin, Puzzle, Music, Clock, Landmark, Map,
};

const GamesPage = () => {
    const [activeGame, setActiveGame] = useState<number | null>(null);
    const gameMeta = gamesData.games.find(g => g.id === activeGame);

    return (
        <div className="w-full min-h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 py-8 md:py-12">
            <header className="mb-10 md:mb-14 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/40 mb-6">
                    <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3 tracking-tight">Play & Learn</h2>
                <p className="text-slate-300 max-w-xl mx-auto text-base md:text-lg">
                    Test your knowledge about India&apos;s culture with these interactive games.
                </p>
            </header>

            {activeGame ? (
                <div className="w-full max-w-4xl mx-auto bg-slate-800/80 border border-slate-600/50 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white transition-colors"
                            aria-label="Back to Arcade"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        {gameMeta && (
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {(() => {
                                    const Icon = GAME_ICONS[gameMeta.icon as keyof typeof GAME_ICONS] || Star;
                                    return <Icon className="w-6 h-6 text-amber-400" />;
                                })()}
                                {gameMeta.title}
                            </h3>
                        )}
                    </div>
                    <div className="min-h-[320px]">
                        {activeGame === 1 && <StateCapitalGame onBack={() => setActiveGame(null)} />}
                        {activeGame === 2 && <PlaceholderGame title="Heritage Site Builder" onBack={() => setActiveGame(null)} />}
                        {activeGame === 3 && <DanceStateGame onBack={() => setActiveGame(null)} />}
                        {activeGame === 4 && <TimelineOrderGame onBack={() => setActiveGame(null)} />}
                        {activeGame === 5 && <MonumentStateGame onBack={() => setActiveGame(null)} />}
                        {activeGame === 6 && <StateToRegionGame onBack={() => setActiveGame(null)} />}
                        {![1, 2, 3, 4, 5, 6].includes(activeGame) && (
                            <PlaceholderGame title="Game" onBack={() => setActiveGame(null)} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {gamesData.games.map(game => {
                        const Icon = GAME_ICONS[(game as { icon?: string }).icon as keyof typeof GAME_ICONS] || Star;
                        return (
                            <button
                                key={game.id}
                                onClick={() => setActiveGame(game.id)}
                                className="group text-left rounded-2xl bg-slate-800/60 border border-slate-600/40 hover:border-amber-500/50 hover:bg-slate-700/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 relative overflow-hidden"
                            >
                                <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity ${game.color}`} />
                                <div className="relative p-6 md:p-8">
                                    <div className={`w-14 h-14 rounded-xl ${game.color} flex items-center justify-center mb-5 opacity-90`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/80 text-xs font-semibold text-slate-300">
                                            {game.type}
                                        </span>
                                        <span className={`text-xs font-bold ${game.difficulty === 'Easy' ? 'text-emerald-400' : game.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {game.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                                    <p className="text-slate-400 text-sm mb-5 line-clamp-2">{game.description}</p>
                                    <span className="inline-flex items-center gap-2 text-amber-400 font-medium group-hover:text-amber-300 transition-colors">
                                        <PlayCircle className="w-5 h-5" />
                                        Play Now
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GamesPage;

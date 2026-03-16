import { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { PlayCircle, Trophy, Star, ArrowLeft, CheckCircle, XCircle, MapPin, Landmark, Music, Clock, Map, Puzzle, Award, User, Download, Loader2 } from 'lucide-react';
import gamesData from '../data/games.json';
import statesData from '../data/states.json';
import timelineData from '../data/timeline.json';
import { REGIONS, REGION_TO_STATES, STATE_TO_REGION, STATE_NAME_MAPPING } from '../constants/regions';

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

type OnBackFn = (score?: string) => void;

// --- State on Map (id: 1): drag state onto correct place on India map ---
const MAP_FILL_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

function StateOnMapGame({ onBack }: { onBack: OnBackFn }) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [roundStates] = useState(() => shuffle([...statesData.states.map(s => s.name)]).slice(0, Math.min(10, statesData.states.length)));
    const [remaining, setRemaining] = useState<string[]>(() => [...roundStates]);
    const [score, setScore] = useState(0);
    const [placed, setPlaced] = useState<Record<string, boolean>>({});
    const [lastDrop, setLastDrop] = useState<{ state: string; correct: boolean } | null>(null);
    const [draggingState, setDraggingState] = useState<string | null>(null);

    useEffect(() => {
        fetch('/india-states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(() => setGeoData(null));
    }, []);

    useEffect(() => {
        if (!geoData || !mapContainerRef.current) return;
        const container = mapContainerRef.current;
        const width = container.clientWidth || 600;
        const height = Math.min(500, width * (850 / 800));
        const projection = d3.geoMercator().fitSize([width, height], geoData);
        const pathGen = d3.geoPath().projection(projection);

        let svgSel = d3.select(container).select<SVGSVGElement>('svg');
        if (svgSel.empty()) {
            svgSel = d3.select(container).append('svg').attr('class', 'w-full h-full');
            svgSel.append('g').attr('class', 'map-group');
        }
        svgSel.attr('viewBox', `0 0 ${width} ${height}`);

        const g = svgSel.select<SVGGElement>('g.map-group');
        const path = g.selectAll<SVGPathElement, GeoJSON.GeometryObject>('path.state').data(geoData.features);

        path.enter().append('path')
            .attr('class', 'state cursor-pointer transition-all duration-200')
            .attr('d', pathGen as (d: unknown) => string | null)
            .attr('fill', (_: unknown, i: number) => MAP_FILL_COLORS[i % MAP_FILL_COLORS.length])
            .attr('stroke', '#fff')
            .attr('stroke-width', '0.5')
            .each((d: unknown, i: number, nodes: ArrayLike<SVGPathElement>) => {
                const feat = d as GeoJSON.Feature & { properties?: { st_nm?: string } };
                const stNm = feat.properties?.st_nm ?? '';
                const appName = STATE_NAME_MAPPING[stNm] || stNm;
                d3.select(nodes[i]).attr('data-state-name', appName);
            })
            .on('dragover', (e: DragEvent) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                d3.select(e.currentTarget as SVGElement).classed('drop-target', true).attr('stroke-width', '2').attr('stroke', '#f59e0b');
            })
            .on('dragleave', (e: DragEvent) => {
                d3.select(e.currentTarget as SVGElement).classed('drop-target', false).attr('stroke-width', '0.5').attr('stroke', '#fff');
            })
            .on('drop', (e: DragEvent) => {
                e.preventDefault();
                const el = d3.select(e.currentTarget as SVGElement);
                el.classed('drop-target', false).attr('stroke-width', '0.5').attr('stroke', '#fff');
                const stateOnPath = el.attr('data-state-name');
                const stateDropped = e.dataTransfer?.getData('text/plain') || '';
                if (!stateDropped || !roundStates.includes(stateDropped)) return;
                const correct = stateOnPath === stateDropped;
                setPlaced(prev => ({ ...prev, [stateDropped]: correct }));
                setRemaining(prev => prev.filter(s => s !== stateDropped));
                if (correct) setScore(s => s + 1);
                setLastDrop({ state: stateDropped, correct });
                setTimeout(() => setLastDrop(null), 1200);
            });

        path.attr('d', pathGen as (d: unknown) => string | null).attr('fill', (_: unknown, i: number) => MAP_FILL_COLORS[i % MAP_FILL_COLORS.length]);
    }, [geoData, roundStates]);

    const done = remaining.length === 0;

    if (roundStates.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">Not enough state data to play.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
            <p className="text-slate-300 text-center text-sm sm:text-base mb-2">Drag each state name onto its correct location on the map</p>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-500/50">
                    <span className="text-white font-bold">{score}</span>
                    <span className="text-slate-400 text-sm ml-1">/ {roundStates.length} correct</span>
                </div>
                <span className="text-slate-400 text-sm">{remaining.length} left to place</span>
            </div>

            <div ref={mapContainerRef} className="w-full min-h-[280px] max-h-[420px] rounded-2xl overflow-hidden border-2 border-slate-500/50 bg-slate-800/40 mb-6 flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full">
                {!geoData && <p className="text-slate-400">Loading map…</p>}
            </div>

            {lastDrop && (
                <div className={`mb-4 p-3 rounded-xl text-center font-medium ${lastDrop.correct ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : 'bg-red-500/20 text-red-400 border border-red-400/50'}`}>
                    {lastDrop.correct ? <><CheckCircle className="w-5 h-5 inline-block mr-2" /> Correct! {lastDrop.state} is in the right place.</> : <><XCircle className="w-5 h-5 inline-block mr-2" /> Wrong. Try placing {lastDrop.state} on the correct state shape.</>}
                </div>
            )}

            <p className="text-slate-500 text-sm mb-2">States to place — drag onto the map:</p>
            <div className="flex flex-wrap gap-2">
                {remaining.map(state => (
                    <div
                        key={state}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', state);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingState(state);
                        }}
                        onDragEnd={() => setDraggingState(null)}
                        className={`px-4 py-2.5 rounded-xl font-medium border-2 cursor-grab active:cursor-grabbing transition-all select-none ${
                            draggingState === state ? 'opacity-70 scale-95' : 'bg-white/95 text-slate-800 border-white/80 hover:border-amber-400/80 hover:shadow-md hover:scale-105'
                        }`}
                    >
                        {state}
                    </div>
                ))}
            </div>

            {Object.keys(placed).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(placed).map(([state, correct]) => (
                        <span key={state} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm ${correct ? 'bg-emerald-600/80 text-white' : 'bg-red-600/80 text-white'}`}>
                            {correct ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {state}
                        </span>
                    ))}
                </div>
            )}

            {done && (
                <div className="mt-8 text-center p-6 rounded-2xl bg-slate-800/60 border border-slate-600/50">
                    <p className="text-2xl font-bold text-white mb-2">Final score: {score} / {roundStates.length}</p>
                    <p className="text-slate-400 text-sm mb-6">States placed on the India map</p>
                    <button onClick={() => onBack(`${score}/${roundStates.length}`)} className="px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Historical Timeline (id: 4) ---
function TimelineOrderGame({ onBack }: { onBack: OnBackFn }) {
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
            <p className="text-slate-300 text-center mb-2 font-medium">Arrange the periods from oldest to most recent</p>
            <p className="text-slate-500 text-sm text-center mb-6">Use the arrows to move each period up or down</p>

            <div className="relative mb-8">
                {/* Timeline spine */}
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-500/50 via-slate-400/40 to-slate-500/50 rounded-full" />

                <ul className="space-y-4 relative">
                    {order.map((p, i) => {
                        const isCorrect = submitted && p.correctIndex === i;
                        const isWrong = submitted && p.correctIndex !== i;
                        return (
                            <li key={p.id} className="relative flex items-center gap-4">
                                {/* Period color dot on timeline */}
                                <div
                                    className="relative z-10 w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white/20"
                                    style={{ backgroundColor: p.color }}
                                >
                                    {i + 1}
                                </div>
                                <div
                                    className={`flex-1 flex items-center justify-between gap-4 py-3 px-5 rounded-2xl border-2 transition-all duration-200 ${
                                        isCorrect
                                            ? 'bg-emerald-500/20 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                                            : isWrong
                                                ? 'bg-red-500/15 border-red-400/60 shadow-lg shadow-red-500/10'
                                                : 'bg-slate-700/60 border-slate-500/40 hover:border-slate-400/60 hover:bg-slate-700/70 shadow-md'
                                    }`}
                                >
                                    <span className="font-bold text-white text-lg tracking-tight">{p.name}</span>
                                    {!submitted && (
                                        <span className="flex gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => move(i, -1)}
                                                className="p-2.5 rounded-xl bg-white/15 text-white hover:bg-white/25 hover:scale-105 transition-all"
                                                aria-label="Move up"
                                            >
                                                <span className="text-lg leading-none">↑</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(i, 1)}
                                                className="p-2.5 rounded-xl bg-white/15 text-white hover:bg-white/25 hover:scale-105 transition-all"
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
                        className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Check order
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-2">Score: {score} / {periods.length} correct</p>
                    <p className="text-slate-400 text-sm mb-6">Chronological order of Indian history periods</p>
                    <button
                        onClick={() => onBack(`${score}/${periods.length}`)}
                        className="px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors"
                    >
                        ← Back to Arcade
                    </button>
                </div>
            )}
        </div>
    );
}

// --- Monument & State (id: 5) ---
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

function MonumentStateGame({ onBack }: { onBack: OnBackFn }) {
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
                <p className="text-white/80 mb-6">Not enough monument data to play.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
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
            <div className="flex justify-between items-center mb-6">
                <span className="text-white/90 font-bold">Score: {score} / {rounds.length}</span>
                <span className="text-slate-400 text-sm">Round {round + 1} of {rounds.length}</span>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-slate-500/40 bg-slate-800/60 shadow-xl mb-8">
                {current.monumentImg ? (
                    <div className="relative aspect-video w-full max-h-56 bg-slate-800">
                        <img src={current.monumentImg} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="text-amber-400/90 text-xs font-semibold uppercase tracking-widest mb-1">Heritage site</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{heritageDisplayName}</h3>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <p className="text-amber-400/90 text-xs font-semibold uppercase tracking-widest mb-1">Heritage site</p>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{heritageDisplayName}</h3>
                    </div>
                )}
                <div className="px-5 py-4 border-t border-slate-600/50 bg-slate-800/40">
                    <p className="text-slate-400 text-sm">In which state is this heritage site located?</p>
                </div>
            </div>

            <p className="text-slate-500 text-sm mb-4">Choose the correct state:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stateOptions.map(state => {
                    const isCorrect = state === current.stateName;
                    const chosen = answered === state;
                    const showRight = answered !== null;
                    let style = 'bg-slate-700/60 hover:bg-slate-600/60 border-slate-500/50 text-white';
                    if (showRight && chosen) style = isCorrect ? 'bg-emerald-600/80 border-emerald-400 text-white' : 'bg-red-600/80 border-red-400 text-white';
                    else if (showRight && isCorrect) style = 'bg-emerald-600/60 border-emerald-400/80 text-white';
                    return (
                        <button
                            key={state}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(state)}
                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-3 ${style}`}
                        >
                            {showRight && chosen && (isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />)}
                            {showRight && !chosen && isCorrect && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />}
                            <span>{state}</span>
                        </button>
                    );
                })}
            </div>

            {answered !== null && !isDone && (
                <div className="mt-8 text-center">
                    <button onClick={next} className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]">Next →</button>
                </div>
            )}
            {isDone && (
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {rounds.length}</p>
                    <button onClick={() => onBack(`${score}/${rounds.length}`)} className="px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Guess the Dance Form (id: 3): dance name → state ---
function getDanceDisplayName(fullName: string, stateName: string): string {
    let name = fullName.trim();
    const state = stateName.trim();
    if (state) {
        const withState = new RegExp(`^${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—]\\s*`, 'i');
        name = name.replace(withState, '').trim();
    }
    if (name.includes('Dance-') || name.includes('Dance -')) {
        const after = name.split(/Dance\s*[-–—]\s*/i).pop();
        if (after) name = after.trim();
    }
    return name || fullName;
}

function DanceStateGame({ onBack }: { onBack: OnBackFn }) {
    const items = useMemo(() => {
        const list: { stateName: string; danceName: string; danceImg?: string }[] = [];
        statesData.states.forEach(s => {
            (s.art_forms?.performing_arts || []).forEach((a: { name?: string; title?: string; img?: string }) => {
                const name = a.name || a.title;
                if (name) list.push({ stateName: s.name, danceName: name, danceImg: a.img });
            });
        });
        return list;
    }, []);

    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState<string | null>(null);
    const [rounds] = useState(() => pickRandom(items, Math.min(10, items.length)));

    const current = rounds[round];
    const danceDisplayName = current ? getDanceDisplayName(current.danceName, current.stateName) : '';
    const stateOptions = useMemo(() => {
        if (!current) return [];
        const wrong = statesData.states.map(s => s.name).filter(n => n !== current.stateName);
        return shuffle([current.stateName, ...pickRandom(wrong, 3)]);
    }, [current]);

    if (!current || stateOptions.length < 4) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">Not enough dance data to play.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
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
            <div className="flex justify-between items-center mb-6">
                <span className="text-white/90 font-bold">Score: {score} / {rounds.length}</span>
                <div className="flex gap-1">
                    {rounds.map((_, i) => (
                        <span
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                i < round ? 'bg-amber-500' : i === round ? 'bg-amber-400 ring-2 ring-amber-400/50' : 'bg-slate-600'
                            }`}
                            aria-hidden
                        />
                    ))}
                </div>
                <span className="text-slate-400 text-sm">Round {round + 1} of {rounds.length}</span>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-slate-500/40 bg-slate-800/60 shadow-xl mb-6">
                {current.danceImg ? (
                    <div className="relative aspect-video w-full max-h-56 bg-slate-800">
                        <img src={current.danceImg} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/95 via-violet-900/30 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <Music className="w-8 h-8 text-violet-300" strokeWidth={1.5} />
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="text-violet-300/90 text-xs font-semibold uppercase tracking-widest mb-1">Classical / Folk dance</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{danceDisplayName}</h3>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-gradient-to-br from-slate-700/80 to-slate-800/80">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="w-14 h-14 rounded-2xl bg-violet-500/30 border border-violet-400/40 flex items-center justify-center shrink-0">
                                <Music className="w-7 h-7 text-violet-300" strokeWidth={1.5} />
                            </span>
                            <div>
                                <p className="text-violet-300/90 text-xs font-semibold uppercase tracking-widest">Classical / Folk dance</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-white">{danceDisplayName}</h3>
                            </div>
                        </div>
                    </div>
                )}
                <div className="px-5 py-4 border-t border-slate-600/50 bg-slate-800/40">
                    <p className="text-slate-400 text-sm">In which state does this dance form originate?</p>
                </div>
            </div>

            <p className="text-slate-500 text-sm mb-3">Tap the correct state:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stateOptions.map(state => {
                    const isCorrect = state === current.stateName;
                    const chosen = answered === state;
                    const showRight = answered !== null;
                    return (
                        <button
                            key={state}
                            disabled={answered !== null}
                            onClick={() => handleAnswer(state)}
                            className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 flex items-center gap-3 min-h-[52px] ${
                                showRight && chosen
                                    ? isCorrect
                                        ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-red-600/90 border-red-400 text-white shadow-lg shadow-red-500/20'
                                    : showRight && isCorrect
                                        ? 'bg-emerald-600/50 border-emerald-400/80 text-white'
                                        : 'bg-slate-700/60 border-slate-500/50 text-white hover:bg-slate-600/60 hover:border-slate-400/60 hover:scale-[1.02] active:scale-[0.99]'
                            }`}
                        >
                            {showRight && chosen && (isCorrect ? <CheckCircle className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />)}
                            {showRight && !chosen && isCorrect && <CheckCircle className="w-6 h-6 shrink-0 text-emerald-300" />}
                            <span className="flex-1">{state}</span>
                        </button>
                    );
                })}
            </div>

            {answered !== null && (
                <div className="mt-4 p-4 rounded-xl bg-slate-700/40 border border-slate-600/50">
                    {answered === current.stateName ? (
                        <p className="text-emerald-400 font-medium flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 shrink-0" /> Correct! This dance is from {current.stateName}.
                        </p>
                    ) : (
                        <p className="text-slate-300 flex items-center gap-2">
                            <XCircle className="w-5 h-5 shrink-0 text-red-400" /> This dance form is from <span className="font-semibold text-amber-400">{current.stateName}</span>.
                        </p>
                    )}
                </div>
            )}

            {answered !== null && !isDone && (
                <div className="mt-6 text-center">
                    <button onClick={next} className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">Next →</button>
                </div>
            )}
            {isDone && (
                <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-white mb-4">Final score: {score} / {rounds.length}</p>
                    <button onClick={() => onBack(`${score}/${rounds.length}`)} className="px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- State to Region drag-and-drop (id: 6) ---
const REGION_STYLES: Record<string, { bg: string; border: string; label: string }> = {
    North: { bg: 'bg-sky-500/25', border: 'border-sky-400', label: 'text-sky-200' },
    South: { bg: 'bg-violet-500/25', border: 'border-violet-400', label: 'text-violet-200' },
    East: { bg: 'bg-teal-500/25', border: 'border-teal-400', label: 'text-teal-200' },
    West: { bg: 'bg-amber-500/25', border: 'border-amber-400', label: 'text-amber-200' },
    Central: { bg: 'bg-emerald-500/25', border: 'border-emerald-400', label: 'text-emerald-200' },
    Northeast: { bg: 'bg-rose-500/25', border: 'border-rose-400', label: 'text-rose-200' },
};

function StateToRegionGame({ onBack }: { onBack: OnBackFn }) {
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
            [region]: [...(prev[region] || []), { state, correct }],
        }));
        setSelectedState(null);
    };

    const handleDragStart = (e: React.DragEvent, state: string) => {
        setDraggedState(state);
        setSelectedState(null);
        e.dataTransfer.setData('text/plain', state);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage((e.target as HTMLElement), 0, 0);
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
        if (remaining.length === 0) setDone(true);
    }, [remaining.length]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <p className="text-slate-300 text-center mb-2">Drag states into the correct region — or tap a state, then tap a region.</p>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-slate-700/60 border border-slate-500/50">
                        <span className="text-white font-bold">{score}</span>
                        <span className="text-slate-400 text-sm ml-1">/ {allStates.length} correct</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: allStates.length }).map((_, i) => (
                            <span
                                key={i}
                                className={`w-1.5 h-6 rounded-full transition-colors ${
                                    i < allStates.length - remaining.length
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-600'
                                }`}
                                aria-hidden
                            />
                        ))}
                    </div>
                </div>
                <span className="text-slate-400 text-sm font-medium">{remaining.length} left to place</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {REGIONS.map(region => {
                    const style = REGION_STYLES[region] || { bg: 'bg-slate-700/40', border: 'border-slate-500', label: 'text-slate-300' };
                    const isDragOver = dragOverRegion === region;
                    const isClickTarget = selectedState !== null;
                    return (
                        <div
                            key={region}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleRegionClick(region)}
                            onKeyDown={(e) => { if (selectedState && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleRegionClick(region); } }}
                            onDragOver={(e) => handleDragOver(e, region)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, region)}
                            className={`min-h-[140px] rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer select-none ${
                                style.bg
                            } ${style.border} ${
                                isDragOver ? 'ring-4 ring-white/60 scale-[1.03] shadow-xl' : ''
                            } ${isClickTarget ? 'hover:ring-2 hover:ring-amber-400/60 hover:scale-[1.01]' : ''}`}
                        >
                            <div className={`font-bold mb-3 flex items-center gap-2 ${style.label}`}>
                                <Map className="w-5 h-5 shrink-0" /> {region}
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                {(placed[region] || []).map(({ state, correct }) => (
                                    <span
                                        key={state}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
                                            correct ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'
                                        }`}
                                    >
                                        {correct ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                                        {state}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mb-2">
                <p className="text-slate-500 text-sm font-medium mb-3">States to place</p>
                <div className="flex flex-wrap gap-2">
                    {remaining.map(state => {
                        const isSelected = selectedState === state;
                        return (
                            <div
                                key={state}
                                draggable
                                onDragStart={(e) => handleDragStart(e, state)}
                                onDragEnd={handleDragEnd}
                                onClick={() => setSelectedState(prev => (prev === state ? null : state))}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedState(prev => (prev === state ? null : state)); } }}
                                className={`px-4 py-2.5 rounded-xl font-medium cursor-grab active:cursor-grabbing border-2 transition-all duration-200 select-none ${
                                    isSelected
                                        ? 'bg-amber-500/90 text-slate-900 border-amber-400 ring-2 ring-amber-400/60 scale-105 shadow-lg'
                                        : 'bg-white/95 text-slate-800 border-white/80 hover:border-slate-300 hover:shadow-md hover:scale-105'
                                }`}
                            >
                                {state}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedState && (
                <p className="text-amber-400 text-sm text-center mb-4">Selected: <span className="font-semibold">{selectedState}</span> — tap a region above to place it.</p>
            )}

            {done && (
                <div className="mt-8 text-center p-6 rounded-2xl bg-slate-800/60 border border-slate-600/50">
                    <p className="text-2xl font-bold text-white mb-2">Final score: {score} / {allStates.length}</p>
                    <p className="text-slate-400 text-sm mb-6">States matched to their regions</p>
                    <button onClick={() => onBack(`${score}/${allStates.length}`)} className="px-6 py-3 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-medium transition-colors">← Back to Arcade</button>
                </div>
            )}
        </div>
    );
}

// --- Heritage Site Builder (id: 2): 2x2 image puzzle ---
function HeritageSiteBuilderGame({ onBack }: { onBack: OnBackFn }) {
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
    const [cells, setCells] = useState<number[]>(() => shuffle([0, 1, 2, 3]));
    const [selected, setSelected] = useState<number | null>(null);

    const solved = cells[0] === 0 && cells[1] === 1 && cells[2] === 2 && cells[3] === 3;

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
        const col = pieceIndex % 2;
        const row = Math.floor(pieceIndex / 2);
        return `${col * 100}% ${row * 100}%`;
    };

    if (!monument) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-white/80 mb-6">No monument images available for the puzzle.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back</button>
            </div>
        );
    }

    if (solved) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center">
                <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-800/50 mb-6">
                    <img src={monument.img} alt={monument.name} className="w-full aspect-video object-cover" />
                </div>
                <p className="text-2xl font-bold text-white mb-2">Well done!</p>
                <p className="text-slate-300 mb-2">You rebuilt <span className="text-amber-400 font-semibold">{monument.name}</span></p>
                <p className="text-slate-400 text-sm mb-6">{monument.stateName}</p>
                <button onClick={() => onBack('1/1')} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium">← Back to Arcade</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <p className="text-slate-300 text-sm mb-4 text-center">Click two pieces to swap them. Rebuild the heritage site.</p>
            <p className="text-white/90 font-semibold text-center mb-4">{monument.name}</p>
            <div className="grid grid-cols-2 gap-1 sm:gap-2 rounded-xl overflow-hidden border-2 border-slate-500/50 bg-slate-900/80 p-2">
                {[0, 1, 2, 3].map(index => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleCellClick(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selected === index ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]' : 'border-slate-600 hover:border-slate-500'
                        }`}
                    >
                        <div
                            className="w-full h-full bg-slate-800 bg-cover bg-no-repeat"
                            style={{
                                backgroundImage: `url(${monument.img})`,
                                backgroundSize: '200% 200%',
                                backgroundPosition: getBackgroundPosition(cells[index]),
                            }}
                        />
                    </button>
                ))}
            </div>
            <p className="text-slate-500 text-xs text-center mt-3">Tap one piece, then another to swap</p>
        </div>
    );
}

// --- Placeholder for other coming-soon games ---
function PlaceholderGame({ title, onBack }: { title: string; onBack: OnBackFn }) {
    return (
        <div className="w-full max-w-2xl mx-auto text-center py-12">
            <Star className="w-16 h-16 text-[var(--color-accent-amber)] mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/70 mb-8">This game is coming soon. Stay tuned!</p>
            <button onClick={() => onBack()} className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-medium inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Arcade
            </button>
        </div>
    );
}

const GAME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    MapPin, Puzzle, Music, Clock, Landmark, Map,
};

// Slightly transparent background image per game (Unsplash — from user-provided links)
const GAME_BG_IMAGES: Record<number, string> = {
    1: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80', // State Capital Match — world map
    2: 'https://images.unsplash.com/photo-1729092087795-bdb99a8c1ad9?w=800&q=80', // Heritage Site Builder — beach
    3: 'https://images.unsplash.com/photo-1768491815837-87a90744f9e6?w=800&q=80', // Guess the Dance Form — dancer
    4: 'https://images.unsplash.com/photo-1765451816990-9d55690b5867?w=800&q=80', // Historical Timeline — silhouette/timeline
    5: 'https://images.unsplash.com/photo-1632941184796-fbbbf2c44e66?w=800&q=80', // Monument & State — building (Hawa Mahal)
    6: 'https://images.unsplash.com/photo-1635713792607-ed81197ecad0?w=800&q=80', // State to Region — mountain range
};

function generateCertificateId(): string {
    return `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

type CertificateData = { gameTitle: string; score?: string };

type LastResult = { gameTitle: string; score?: string };

const GamesPage = () => {
    const [playerName, setPlayerName] = useState('');
    const [nameSubmitted, setNameSubmitted] = useState(false);
    const [activeGame, setActiveGame] = useState<number | null>(null);
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [lastResult, setLastResult] = useState<LastResult | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);
    const gameMeta = gamesData.games.find(g => g.id === activeGame);

    const handleStartPlaying = (e: React.FormEvent) => {
        e.preventDefault();
        const name = playerName.trim();
        if (name) setNameSubmitted(true);
    };

    const handleLeaveGame = (score?: string) => {
        // Only show certificate when user finished the game (left with a score). Header back = no score = just go to games list.
        if (gameMeta && score != null && score !== '') {
            setCertificate({ gameTitle: gameMeta.title, score });
            setLastResult({ gameTitle: gameMeta.title, score });
        }
        setActiveGame(null);
    };

    const handleOpenCertificateForDownload = () => {
        if (lastResult) setCertificate({ gameTitle: lastResult.gameTitle, score: lastResult.score });
    };

    const handleCertificateClose = () => {
        setCertificate(null);
        setActiveGame(null);
    };

    const handleDownloadCertificate = async () => {
        if (!certificateRef.current || isDownloading) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fefce8',
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `Certificate_${playerName.replace(/\s+/g, '_')}_${certificate?.gameTitle?.replace(/\s+/g, '_') ?? 'Game'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch {
            window.print();
        } finally {
            setIsDownloading(false);
        }
    };

    // Name entry screen (before any game) — transparent glassmorphism
    if (!nameSubmitted) {
        return (
            <div className="w-full min-h-full flex flex-col items-center justify-center px-4 sm:px-6 py-12">
                <div
                    className="w-full max-w-md rounded-3xl p-8 sm:p-10 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01] backdrop-blur-xl border border-white/10"
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.35) 0%, rgba(15, 23, 42, 0.45) 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                    <div className="flex justify-center mb-6">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-amber-400/40 backdrop-blur-sm"
                            style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                            }}
                        >
                            <User className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white text-center mb-2 drop-shadow-md">Enter Your Name</h2>
                    <p className="text-slate-300 text-sm text-center mb-6 drop-shadow-sm">
                        Your name will appear on your certificate when you complete a game.
                    </p>
                    <form onSubmit={handleStartPlaying} className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Type your name here"
                                className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 border border-white/15 backdrop-blur-sm"
                                style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.05)',
                                }}
                                required
                                minLength={1}
                                maxLength={64}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl font-bold text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                            style={{
                                background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            Start Playing
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Certificate overlay (after leaving a game) — NCERT / Ministry of Culture style, rectangle, with spacing from navbar
    if (certificate) {
        const certId = generateCertificateId();
        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/60 backdrop-blur-sm pt-20 sm:pt-28 md:pt-32 pb-6 sm:pb-8 px-3 sm:px-4 overflow-y-auto">
                <div className="w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-6 mt-0">
                    {/* Certificate card — rectangle, no rounded corners */}
                    <div
                        ref={certificateRef}
                        className="w-full bg-[#fefce8] border-4 border-slate-800 shadow-2xl overflow-hidden rounded-none"
                        style={{ minHeight: '420px' }}
                    >
                        {/* Tricolour strip — Government of India */}
                        <div className="flex h-2">
                            <div className="flex-1 bg-[#FF9933]" />
                            <div className="flex-1 bg-white" />
                            <div className="flex-1 bg-[#138808]" />
                        </div>
                        <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
                            {/* Official header — NCERT & Ministry of Culture */}
                            <p className="text-center text-slate-700 text-xs font-semibold tracking-widest uppercase mb-0.5">
                                Government of India
                            </p>
                            <p className="text-center text-slate-800 text-sm font-bold tracking-wide mb-0.5">
                                Ministry of Culture
                            </p>
                            <p className="text-center text-slate-600 text-xs font-medium mb-0.5">
                                National Council of Educational Research and Training (NCERT)
                            </p>
                            <p className="text-center text-slate-500 text-xs font-medium mb-6">
                                Digital India · Cultural Exploration Platform
                            </p>
                            {/* Decorative line */}
                            <div className="flex justify-center gap-2 mb-6">
                                <span className="w-12 h-0.5 bg-slate-400" />
                                <Award className="w-6 h-6 text-amber-600 shrink-0" strokeWidth={1.5} />
                                <span className="w-12 h-0.5 bg-slate-400" />
                            </div>
                            <h2 className="text-center text-slate-900 font-serif text-xl sm:text-2xl font-bold tracking-tight mb-6">
                                Certificate of Participation
                            </h2>
                            <p className="text-slate-700 text-center text-sm leading-relaxed mb-4">
                                This is to certify that
                            </p>
                            <p className="text-slate-900 font-serif text-2xl sm:text-3xl font-bold text-center mb-4">
                                {playerName}
                            </p>
                            <p className="text-slate-700 text-center text-sm leading-relaxed mb-2">
                                has successfully completed the game
                            </p>
                            <p className="text-slate-900 font-serif text-lg sm:text-xl font-semibold text-center mb-6">
                                {certificate.gameTitle}
                            </p>
                            {certificate.score != null && (
                                <p className="text-slate-600 text-center text-sm mb-4">Score: {certificate.score}</p>
                            )}
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-600 text-xs">
                                <span>Date: {dateStr}</span>
                                <span>Certificate No.: {certId}</span>
                            </div>
                        </div>
                        {/* Bottom border accent */}
                        <div className="flex h-1">
                            <div className="flex-1 bg-[#FF9933]" />
                            <div className="flex-1 bg-white" />
                            <div className="flex-1 bg-[#138808]" />
                        </div>
                    </div>
                    {/* Actions — Download (primary) and Back to Arcade */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button
                            type="button"
                            onClick={handleDownloadCertificate}
                            disabled={isDownloading}
                            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/70 disabled:cursor-not-allowed text-slate-900 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Downloading…
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 shrink-0" />
                                    Download Certificate
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCertificateClose}
                            className="py-3.5 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Back to Arcade
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-full overflow-y-auto overflow-x-hidden bg-transparent px-3 sm:px-6 py-6 sm:py-8 md:py-12">
            <header className="mb-10 md:mb-14 text-center">
                <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 border-2 border-amber-400/40"
                    style={{
                        background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.2) 0%, rgba(180, 83, 9, 0.15) 100%)',
                        boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-3 tracking-tight drop-shadow-lg">Play & Learn</h2>
                <p className="text-slate-300 max-w-xl mx-auto text-base md:text-lg">
                    Test your knowledge about India&apos;s culture with these interactive games.
                </p>
            </header>

            {/* Greeting: Hi, [playerName] */}
            <div className="flex justify-center mb-6">
                <p
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-center border border-white/10 backdrop-blur-sm"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.35) 100%)',
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                    }}
                >
                    <span className="text-slate-400 text-base sm:text-lg font-medium tracking-wide">Hi,</span>
                    <span
                        className="font-serif text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500"
                        style={{ textShadow: '0 0 24px rgba(245, 158, 11, 0.25)' }}
                    >
                        {playerName}
                    </span>
                </p>
            </div>

            {/* Last score + Download certificate on games list — 3D card */}
            {!activeGame && lastResult && (
                <div
                    className="mb-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-2xl border border-slate-500/40"
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <div className="flex items-center gap-2 text-slate-200">
                        <Star className="w-5 h-5 text-amber-400 shrink-0" />
                        <span className="font-medium">Last score:</span>
                        <span className="text-white font-semibold">{lastResult.gameTitle}</span>
                        {lastResult.score != null && (
                            <span className="text-amber-400 font-bold">{lastResult.score}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenCertificateForDownload}
                        className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <Download className="w-5 h-5 shrink-0" />
                        Download certificate
                    </button>
                </div>
            )}

            {activeGame ? (
                <div
                    className="w-full max-w-4xl mx-auto mt-4 md:mt-6 pt-6 sm:pt-8 rounded-3xl p-6 md:p-8 pointer-events-auto relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(160deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                    }}
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            type="button"
                            id="game-back-button"
                            onClick={() => handleLeaveGame()}
                            className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white transition-colors shrink-0"
                            aria-label="Back to games list"
                        >
                            <ArrowLeft className="w-5 h-5" aria-hidden />
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
                        {activeGame === 1 && <StateOnMapGame onBack={handleLeaveGame} />}
                        {activeGame === 2 && <HeritageSiteBuilderGame onBack={handleLeaveGame} />}
                        {activeGame === 3 && <DanceStateGame onBack={handleLeaveGame} />}
                        {activeGame === 4 && <TimelineOrderGame onBack={handleLeaveGame} />}
                        {activeGame === 5 && <MonumentStateGame onBack={handleLeaveGame} />}
                        {activeGame === 6 && <StateToRegionGame onBack={handleLeaveGame} />}
                        {![1, 2, 3, 4, 5, 6].includes(activeGame) && (
                            <PlaceholderGame title="Game" onBack={handleLeaveGame} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {gamesData.games.map(game => {
                        const Icon = GAME_ICONS[(game as { icon?: string }).icon as keyof typeof GAME_ICONS] || Star;
                        const bgImage = GAME_BG_IMAGES[game.id];
                        return (
                            <button
                                key={game.id}
                                onClick={() => setActiveGame(game.id)}
                                className="group text-left rounded-xl sm:rounded-2xl relative overflow-hidden min-h-[200px] sm:min-h-[240px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                                style={bgImage ? {
                                    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.6)), url(${bgImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                } : {
                                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-80" />
                                {!bgImage && <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity ${game.color}`} />}
                                <div className="relative p-4 sm:p-6 md:p-8">
                                    <div
                                        className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center mb-5 ring-2 ring-white/25 group-hover:ring-white/50 group-hover:scale-110 transition-all duration-300`}
                                        style={{ boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}
                                    >
                                        <Icon className="w-8 h-8 text-white drop-shadow-sm stroke-2" />
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/80 text-xs font-semibold text-slate-300 shadow-inner">
                                            {game.type}
                                        </span>
                                        <span className={`text-xs font-bold ${game.difficulty === 'Easy' ? 'text-emerald-400' : game.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                                            {game.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-sm">{game.title}</h3>
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

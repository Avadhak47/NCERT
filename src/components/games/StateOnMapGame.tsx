import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Trophy, Loader2 } from 'lucide-react';
import statesData from '../../data/states.json';
import { STATE_NAME_MAPPING } from '../../constants/regions';
import { shuffle } from '../../utils/gameUtils';

const MAP_FILL_COLORS = ['#8B4513', '#FF9933', '#008080', '#C5B358', '#87CEEB'];

type OnBackFn = (score?: string) => void;

interface StateOnMapGameProps {
    onBack: OnBackFn;
}

const StateOnMapGame: React.FC<StateOnMapGameProps> = ({ onBack }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [roundStates] = useState(() => shuffle([...statesData.states.map(s => s.name)]).slice(0, Math.min(10, statesData.states.length)));
    const [remaining, setRemaining] = useState<string[]>(() => [...roundStates]);
    const [score, setScore] = useState(0);
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
        const width = container.clientWidth || 800;
        const height = 600;
        const projection = d3.geoMercator().fitExtent([[30, 30], [width - 30, height - 30]], geoData);
        const pathGen = d3.geoPath().projection(projection);

        let svgSel = d3.select(container).select<SVGSVGElement>('svg');
        if (svgSel.empty()) {
            svgSel = d3.select(container).append('svg').attr('class', 'w-full h-full drop-shadow-2xl');
            svgSel.append('g').attr('class', 'map-group');
        }
        svgSel.attr('viewBox', `0 0 ${width} ${height}`);

        const g = svgSel.select<SVGGElement>('g.map-group');
        const path = g.selectAll<SVGPathElement, GeoJSON.GeometryObject>('path.state').data(geoData.features);

        path.enter().append('path')
            .attr('class', 'state cursor-pointer transition-all duration-300')
            .attr('d', pathGen as (d: unknown) => string | null)
            .attr('fill', (_: unknown, i: number) => MAP_FILL_COLORS[i % MAP_FILL_COLORS.length])
            .attr('stroke', '#fff')
            .attr('stroke-width', '1')
            .each((d: unknown, i: number, nodes: ArrayLike<SVGPathElement>) => {
                const feat = d as GeoJSON.Feature & { properties?: { st_nm?: string } };
                const stNm = feat.properties?.st_nm ?? '';
                const appName = STATE_NAME_MAPPING[stNm] || stNm;
                d3.select(nodes[i]).attr('data-state-name', appName);
            })
            .on('dragover', (e: DragEvent) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                d3.select(e.currentTarget as SVGElement).classed('drop-target', true).attr('stroke-width', '3').attr('stroke', '#f59e0b').attr('opacity', '0.8');
            })
            .on('dragleave', (e: DragEvent) => {
                d3.select(e.currentTarget as SVGElement).classed('drop-target', false).attr('stroke-width', '1').attr('stroke', '#fff').attr('opacity', '1');
            })
            .on('drop', (e: DragEvent) => {
                e.preventDefault();
                const el = d3.select(e.currentTarget as SVGElement);
                el.classed('drop-target', false).attr('stroke-width', '1').attr('stroke', '#fff').attr('opacity', '1');
                const stateOnPath = el.attr('data-state-name');
                const stateDropped = e.dataTransfer?.getData('text/plain') || '';
                if (!stateDropped || !roundStates.includes(stateDropped)) return;
                
                const correct = stateOnPath === stateDropped;
                setRemaining(prev => prev.filter(s => s !== stateDropped));
                if (correct) setScore(s => s + 1);
                setLastDrop({ state: stateDropped, correct });
                setTimeout(() => setLastDrop(null), 1500);
            });

        path.attr('d', pathGen as (d: unknown) => string | null).attr('fill', (_: unknown, i: number) => MAP_FILL_COLORS[i % MAP_FILL_COLORS.length]);
    }, [geoData, roundStates]);

    const done = remaining.length === 0;

    if (roundStates.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center py-12">
                <p className="text-black/80 mb-6 font-bold">No state data found.</p>
                <button onClick={() => onBack()} className="px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 border border-white/50 text-black font-black shadow-sm transition-all">← Back</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <p className="text-black text-center text-sm mb-6 font-bold uppercase tracking-widest opacity-70">Identify the states on the map</p>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/3 order-2 lg:order-1">
                    <div className="mb-6 p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-black font-black text-2xl">{score} <span className="text-sm opacity-50">/ {roundStates.length}</span></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 px-3 py-1 rounded-full">{remaining.length} remaining</span>
                        </div>
                        <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-[var(--color-brand-primary)]" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(score / roundStates.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-black text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">States to place:</p>
                        <div className="flex flex-wrap lg:flex-col gap-3">
                            {remaining.map(state => (
                                <div
                                    key={state}
                                    draggable
                                    onDragStart={(e: React.DragEvent) => {
                                        e.dataTransfer.setData('text/plain', state);
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggingState(state);
                                    }}
                                    onDragEnd={() => setDraggingState(null)}
                                    className={`px-5 py-3.5 rounded-2xl font-black text-sm tracking-tight border-2 cursor-grab active:cursor-grabbing transition-all select-none shadow-sm flex items-center gap-3 ${
                                        draggingState === state ? 'opacity-40 scale-90 border-dashed' : 'bg-white/80 backdrop-blur-md text-black border-white/60 hover:border-[var(--color-brand-primary)]/50 hover:shadow-lg'
                                    }`}
                                >
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] opacity-40" />
                                    {state}
                                </div>
                            ))}
                        </div>
                    </div>

                    {lastDrop && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest border-2 ${lastDrop.correct ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}
                        >
                            {lastDrop.correct ? 'Perfect Match!' : 'Incorrect Placement'}
                        </motion.div>
                    )}
                </div>

                <div className="w-full lg:w-2/3 order-1 lg:order-2">
                    <div ref={mapContainerRef} className="w-full min-h-[400px] h-[550px] sm:h-[650px] rounded-[2.5rem] overflow-hidden border border-white/60 bg-white/30 backdrop-blur-2xl shadow-2xl relative flex items-center justify-center p-4">
                        {!geoData && (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)]" />
                                <p className="text-black/40 font-black uppercase tracking-widest text-[10px]">Assembling India Map…</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {done && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-12 text-center p-12 rounded-[3rem] bg-white/60 backdrop-blur-3xl border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
                >
                    <Trophy className="w-16 h-16 text-[var(--color-brand-primary)] mx-auto mb-6" />
                    <p className="text-4xl font-black text-black mb-2 tracking-tight">Challenge Complete!</p>
                    <p className="text-black text-sm mb-8 font-black uppercase tracking-widest opacity-60">You placed {score} out of {roundStates.length} states correctly</p>
                    <button onClick={() => onBack(`${score}/${roundStates.length}`)} className="px-10 py-4 rounded-2xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white font-black shadow-xl shadow-[var(--color-brand-primary)]/20 transition-all hover:scale-105 active:scale-95">Claim Certificate</button>
                </motion.div>
            )}
        </div>
    );
};

export default StateOnMapGame;

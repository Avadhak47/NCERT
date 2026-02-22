import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

interface InteractiveMapProps {
    onStateSelect: (stateId: string, stateName: string) => void;
    onRegionSelect?: (regionName: string | null) => void;
    activeStateId?: string | null;
}

// Maps specific Indian state ISO/Names to general regions
// Maps map JSON property 'st_nm' to states.json 'name'
const STATE_NAME_MAPPING: Record<string, string> = {
    'Andaman and Nicobar Islands': 'Andaman & Nicobar',
    'Dadra and Nagar Haveli': 'Dadar & Nagar Haveli',
    'Daman and Diu': 'Daman & Diu',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Odisha': 'Orissa',
    'Uttarakhand': 'Uttarkhand',
    'Ladakh': 'Jammu & Kashmir' // Fall back to J&K dashboard for Ladakh data
};

// Maps specific Indian state ISO/Names to general regions
const REGION_MAP: Record<string, string> = {
    // North
    'Jammu and Kashmir': 'North',
    'Himachal Pradesh': 'North',
    'Punjab': 'North',
    'Uttarakhand': 'North',
    'Haryana': 'North',
    'Delhi': 'North',
    'Uttar Pradesh': 'North',
    'Chandigarh': 'North',
    'Ladakh': 'North',
    // West
    'Rajasthan': 'West',
    'Gujarat': 'West',
    'Maharashtra': 'West',
    'Goa': 'West',
    'Dadra and Nagar Haveli': 'West',
    'Daman and Diu': 'West',
    // Central
    'Madhya Pradesh': 'Central',
    'Chhattisgarh': 'Central',
    // East
    'Bihar': 'East',
    'Jharkhand': 'East',
    'West Bengal': 'East',
    'Odisha': 'East',
    // South
    'Andhra Pradesh': 'South',
    'Telangana': 'South',
    'Karnataka': 'South',
    'Kerala': 'South',
    'Tamil Nadu': 'South',
    'Puducherry': 'South',
    'Andaman and Nicobar Islands': 'South',
    'Lakshadweep': 'South',
    // Northeast
    'Sikkim': 'Northeast',
    'Assam': 'Northeast',
    'Arunachal Pradesh': 'Northeast',
    'Nagaland': 'Northeast',
    'Manipur': 'Northeast',
    'Mizoram': 'Northeast',
    'Tripura': 'Northeast',
    'Meghalaya': 'Northeast'
};

const REGIONS = ['North', 'West', 'Central', 'East', 'South', 'Northeast'];

// Geographic coordinates for all state capitals
const POIS = [
    { name: "New Delhi", lat: 28.6139, lon: 77.2090, type: "capital" },
    { name: "Srinagar", lat: 34.0836, lon: 74.7973, type: "capital" },
    { name: "Leh", lat: 34.1526, lon: 77.5770, type: "capital" },
    { name: "Shimla", lat: 31.1048, lon: 77.1734, type: "capital" },
    { name: "Dehradun", lat: 30.3165, lon: 78.0322, type: "capital" },
    { name: "Chandigarh", lat: 30.7333, lon: 76.7794, type: "capital" },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873, type: "capital" },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462, type: "capital" },
    { name: "Patna", lat: 25.5941, lon: 85.1376, type: "capital" },
    { name: "Ranchi", lat: 23.3441, lon: 85.3096, type: "capital" },
    { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, type: "capital" },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639, type: "capital" },
    { name: "Gangtok", lat: 27.3389, lon: 88.6065, type: "capital" },
    { name: "Dispur", lat: 26.1433, lon: 91.7898, type: "capital" },
    { name: "Itanagar", lat: 27.0844, lon: 93.6053, type: "capital" },
    { name: "Kohima", lat: 25.6751, lon: 94.1086, type: "capital" },
    { name: "Imphal", lat: 24.8170, lon: 93.9368, type: "capital" },
    { name: "Aizawl", lat: 23.7271, lon: 92.7176, type: "capital" },
    { name: "Agartala", lat: 23.8315, lon: 91.2868, type: "capital" },
    { name: "Shillong", lat: 25.5788, lon: 91.8933, type: "capital" },
    { name: "Bhopal", lat: 23.2599, lon: 77.4126, type: "capital" },
    { name: "Raipur", lat: 21.2514, lon: 81.6296, type: "capital" },
    { name: "Gandhinagar", lat: 23.2156, lon: 72.6369, type: "capital" },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, type: "capital" },
    { name: "Panaji", lat: 15.4909, lon: 73.8278, type: "capital" },
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946, type: "capital" },
    { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, type: "capital" },
    { name: "Chennai", lat: 13.0827, lon: 80.2707, type: "capital" },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867, type: "capital" },
    { name: "Amaravati", lat: 16.5062, lon: 80.5214, type: "capital" },
    { name: "Port Blair", lat: 11.6234, lon: 92.7265, type: "capital" },
    { name: "Kavaratti", lat: 10.5667, lon: 72.6417, type: "capital" },
    { name: "Puducherry", lat: 11.9416, lon: 79.8083, type: "capital" },
    { name: "Silvassa", lat: 20.2736, lon: 73.0039, type: "capital" },
    { name: "Daman", lat: 20.3974, lon: 72.8328, type: "capital" }
];

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onStateSelect, onRegionSelect, activeStateId }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    const [activeState, setActiveState] = useState<string | null>(null);
    const [mapData, setMapData] = useState<any>(null);
    const [pathGen, setPathGen] = useState<any>(null);

    useEffect(() => {
        // Fetch accurate GeoJSON for India from local public folder
        fetch('public/india-states.json')
            .then(res => res.json())
            .then(data => setMapData(data))
            .catch(err => console.error("Error fetching map data: ", err));
    }, []);

    // Memoize bounding boxes for each region
    const regionBounds = useMemo(() => {
        if (!mapData || !pathGen) return {};

        const bounds: Record<string, [[number, number], [number, number]]> = {};

        REGIONS.forEach(region => {
            // Find all features belonging to this region
            const features = mapData.features.filter((f: any) => {
                const name = f.properties.st_nm;
                return REGION_MAP[name] === region;
            });

            if (features.length === 0) return;

            // Calculate merged bounding box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            features.forEach((f: any) => {
                const b = pathGen.bounds(f);
                if (b[0][0] < minX) minX = b[0][0];
                if (b[0][1] < minY) minY = b[0][1];
                if (b[1][0] > maxX) maxX = b[1][0];
                if (b[1][1] > maxY) maxY = b[1][1];
            });

            bounds[region] = [[minX, minY], [maxX, maxY]];
        });

        return bounds;
    }, [mapData, pathGen]);

    useEffect(() => {
        if (!svgRef.current || !mapData) return;
        const svg = d3.select(svgRef.current);

        // Only set up projection/paths on initial load
        if (svg.select('g.map-group').empty()) {
            const width = 800;
            const height = 850;

            // Setup projection to fit India
            const projection = d3.geoMercator().fitSize([width, height], mapData);
            const pathGenerator = d3.geoPath().projection(projection);
            setPathGen(() => pathGenerator); // Store for later zoom calculations

            const g = svg.append('g').attr('class', 'map-group transition-opacity duration-500');

            // Draw states
            g.selectAll('path.state')
                .data(mapData.features)
                .enter()
                .append('path')
                .attr('class', 'state cursor-pointer transition-all duration-300 hover:brightness-110 focus:outline-none focus:ring-2')
                .attr('id', (d: any) => `state-${(d.properties.st_nm || '').toString().replace(/\s+/g, '-')}`)
                .attr('d', pathGenerator as any)
                .attr('fill', (_d: any, i) => {
                    const colors = ['#0284c7', '#ea580c', '#16a34a', '#8b5cf6', '#eab308', '#ec4899', '#14b8a6'];
                    return colors[i % colors.length];
                })
                .attr('stroke', '#ffffff')
                .attr('stroke-width', '1')
                .attr('tabindex', 0)
                .attr('role', 'button')
                .attr('aria-label', (d: any) => `State ${d.properties.st_nm}`)
                .style('opacity', 1);

            // Draw POI markers
            const poiGroup = svg.append('g').attr('class', 'poi-group pointer-events-none transition-opacity duration-500');
            poiGroup.selectAll('circle.poi')
                .data(POIS)
                .enter()
                .append('circle')
                .attr('class', 'poi')
                .attr('cx', d => { const coord = projection([d.lon, d.lat]); return coord ? coord[0] : 0; })
                .attr('cy', d => { const coord = projection([d.lon, d.lat]); return coord ? coord[1] : 0; })
                .attr('r', 4)
                .attr('fill', d => {
                    if (d.type === 'capital') return '#dc2626'; // red
                    if (d.type === 'monument') return '#fbbf24'; // amber
                    if (d.type === 'geography') return '#16a34a'; // green
                    return '#e5e7eb'; // default city dot
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);

            poiGroup.selectAll('text.poi-label')
                .data(POIS)
                .enter()
                .append('text')
                .attr('class', 'poi-label text-[8px] font-bold fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]')
                .attr('x', d => { const coord = projection([d.lon, d.lat]); return coord ? coord[0] + 6 : 0; })
                .attr('y', d => { const coord = projection([d.lon, d.lat]); return coord ? coord[1] + 3 : 0; })
                .text(d => d.name);
        }

        // Update handlers to rely on current state
        const svgUpdate = d3.select(svgRef.current);
        svgUpdate.selectAll('path.state')
            .on('click', (_event, d: any) => handleStateClick(d))
            .on('keydown', (event, d: any) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    handleStateClick(d);
                }
            });

        // Background click to zoom out
        svgUpdate.on('dblclick', () => {
            if (activeRegion || activeState) {
                resetZoom();
            }
        });

    }, [mapData, activeRegion, activeState, regionBounds]);

    // Track external resets (e.g. closing dashboard)
    useEffect(() => {
        if (activeStateId === null && activeState !== null) {
            setActiveState(null);
            if (activeRegion && regionBounds[activeRegion]) {
                zoomToBounds(d3.select(svgRef.current), regionBounds[activeRegion], 120);
            } else {
                resetZoom();
            }
        }
    }, [activeStateId, activeState, activeRegion, regionBounds]);

    // Handle styling changes distinctly from path generation
    useEffect(() => {
        if (!svgRef.current || !mapData) return;
        const svg = d3.select(svgRef.current);

        svg.selectAll('path.state').each(function (d: any) {
            const stateName = d.properties.st_nm;
            const stateRegion = REGION_MAP[stateName] || 'Unknown';
            const element = d3.select(this);

            // Styling logic based on current zoom level
            if (activeState) {
                // Dim everything except active state
                if (stateName === activeState) {
                    element.style('opacity', 1).attr('stroke-width', '3').attr('stroke', '#0f172a');
                } else {
                    element.style('opacity', 0.2).attr('stroke-width', '1').attr('stroke', '#ffffff');
                }
            } else if (activeRegion) {
                // Dim states outside the active region, highlight border
                if (stateRegion === activeRegion) {
                    element.style('opacity', 1).attr('stroke-width', '2').attr('stroke', '#ffffff');
                } else {
                    element.style('opacity', 0.1).attr('stroke-width', '0.5').attr('stroke', '#ffffff');
                }
            } else {
                // Default state
                element.style('opacity', 1).attr('stroke-width', '1').attr('stroke', '#ffffff');
            }
        });

        // Handle POI visibility based on zoom
        if (activeRegion || activeState) {
            svg.select('g.poi-group').style('opacity', 1);
        } else {
            svg.select('g.poi-group').style('opacity', 0);
        }
    }, [activeRegion, activeState, mapData]);

    const handleStateClick = (d: any) => {
        playSwooshAudio();
        const svg = d3.select(svgRef.current);
        const stNm = d.properties.st_nm;
        const stateName = STATE_NAME_MAPPING[stNm] || stNm;
        const stateId = STATE_NAME_MAPPING[stNm] || stNm;
        const stateRegion = REGION_MAP[stNm] || 'Unknown';

        if (!activeRegion) {
            // STEP 1: Zoom to Region
            setActiveRegion(stateRegion);
            if (onRegionSelect) onRegionSelect(stateRegion);
            setActiveState(null);

            const bounds = regionBounds[stateRegion];
            if (bounds) zoomToBounds(svg, bounds, 120);

        } else if (activeRegion === stateRegion && activeState !== stateName) {
            // STEP 2: Inside Region, Click State -> Zoom to State
            setActiveState(stateName);

            const bounds = pathGen.bounds(d);
            zoomToBounds(svg, bounds, 60);

            // Bubble up selection to parent
            setTimeout(() => {
                onStateSelect(stateId, stateName);
            }, 800);

        } else if (activeState === stateName) {
            // Click active state -> zoom back to region
            setActiveState(null);
            const bounds = regionBounds[stateRegion];
            if (bounds) zoomToBounds(svg, bounds, 120);
            onStateSelect('', ''); // Clear parent selection
        } else {
            // Click state in different region -> Zoom to new region entirely
            setActiveRegion(stateRegion);
            if (onRegionSelect) onRegionSelect(stateRegion);
            setActiveState(null);
            const bounds = regionBounds[stateRegion];
            if (bounds) zoomToBounds(svg, bounds, 120);
            onStateSelect('', '');
        }
    };

    const zoomToBounds = (svg: any, bounds: [[number, number], [number, number]], padding: number) => {
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;

        const vw = dx + padding * 2;
        const vh = dy + padding * 2;
        const vx = x - vw / 2;
        const vy = y - vh / 2;

        const targetViewBox = `${vx} ${vy} ${vw} ${vh}`;

        svg.transition()
            .duration(800)
            .attrTween('viewBox', function () {
                const currentViewBox = svgRef.current?.getAttribute('viewBox') || '-20 -60 840 980';
                const i = d3.interpolateString(currentViewBox, targetViewBox);
                return function (t: number) { return i(t); };
            });
    };

    const resetZoom = () => {
        playSwooshAudio();
        setActiveRegion(null);
        if (onRegionSelect) onRegionSelect(null);
        setActiveState(null);
        onStateSelect('', '');

        d3.select(svgRef.current).transition().duration(800)
            .attrTween('viewBox', function () {
                const currentViewBox = svgRef.current?.getAttribute('viewBox') || '-20 -60 840 980';
                const i = d3.interpolateString(currentViewBox, '-20 -60 840 980');
                return function (t: number) { return i(t); };
            });
    };

    const playSwooshAudio = () => {
        // We would use an AudioContext or HTMLAudioElement here.
        console.log('Audio: Swoosh!');
    };

    return (
        <div className="w-full h-full relative flex items-center justify-center bg-[var(--color-surface-muted)]">
            {!mapData && (
                <div className="absolute flex flex-col items-center justify-center text-[var(--color-brand-primary)]">
                    <div className="w-12 h-12 border-4 border-[var(--color-brand-secondary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-bold animate-pulse text-xl">Loading India Map...</p>
                </div>
            )}

            {/* Visual indication for double click to reset */}
            {mapData && (activeRegion || activeState) && (
                <div className="absolute top-6 text-center z-10 animate-bounce pointer-events-none">
                    <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-[var(--color-text-muted)] text-sm font-bold border-2 border-white/50">
                        Double-click background to zoom out
                    </span>
                </div>
            )}

            <svg
                ref={svgRef}
                viewBox="-20 -60 840 980"
                className={`w-full h-full drop-shadow-2xl transition-opacity duration-500 scale-[1.05] md:scale-100 ${mapData ? 'opacity-100' : 'opacity-0'}`}
                style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }}
            >
                {/* Background Rect to catch double clicks safely */}
                <rect width="100%" height="100%" fill="transparent" />
            </svg>

            {/* Breadcrumb controls */}
            {activeRegion && (
                <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-2 border-[var(--color-brand-primary)] z-10 transition-all">
                    <button
                        onClick={resetZoom}
                        className="px-4 py-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-muted)] rounded-xl transition-colors"
                    >
                        India
                    </button>
                    <span className="text-[var(--color-brand-secondary)]">›</span>
                    <button
                        onClick={() => {
                            setActiveState(null);
                            const bounds = regionBounds[activeRegion];
                            if (bounds) zoomToBounds(d3.select(svgRef.current), bounds, 120);
                            onStateSelect('', '');
                        }}
                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${!activeState ? 'text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10' : 'text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-muted)]'}`}
                    >
                        {activeRegion} Region
                    </button>
                    {activeState && (
                        <>
                            <span className="text-[var(--color-brand-secondary)]">›</span>
                            <div className="px-4 py-2 text-sm font-black text-white bg-[var(--color-brand-primary)] shadow-md rounded-xl">
                                {activeState}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

interface InteractiveMapProps {
    // Engine State & Actions
    activeState: string | null;
    activeRegion: string | null;
    pois: any[];
    mapData: any;
    colors: any;
    onStateClick: (stateName: string, stateId: string) => void;
    onRegionClick: (regionName: string) => void;
    onBackgroundClick: () => void;

    // Legacy props kept for now to avoid breaking other pages if any
    onMonumentSelect?: (monumentId: string) => void;
    activeMonumentId?: string | null;
}

const STATE_NAME_MAPPING: Record<string, string> = {
    'Andaman and Nicobar Islands': 'Andaman & Nicobar',
    'Dadra and Nagar Haveli': 'Dadar & Nagar Haveli',
    'Daman and Diu': 'Daman & Diu',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Odisha': 'Orissa',
    'Uttarakhand': 'Uttarkhand'
};

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

const InteractiveMap: React.FC<InteractiveMapProps> = ({
    activeState,
    activeRegion,
    pois,
    mapData,
    colors,
    onStateClick,
    onRegionClick,
    onBackgroundClick,
    onMonumentSelect,
    activeMonumentId
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [pathGen, setPathGen] = useState<any>(null);

    // Memoize bounding boxes for each region
    const regionBounds = useMemo(() => {
        if (!mapData || !pathGen) return {};

        const bounds: Record<string, [[number, number], [number, number]]> = {};

        REGIONS.forEach(region => {
            const features = mapData.features.filter((f: any) => {
                const name = f.properties.st_nm;
                return REGION_MAP[name] === region;
            });

            if (features.length === 0) return;

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

    // Initialize Map Projection
    useEffect(() => {
        if (!svgRef.current || !mapData) return;
        const svg = d3.select(svgRef.current);

        if (svg.select('g.map-group').empty()) {
            const width = 800;
            const height = 850;

            const projection = d3.geoMercator().fitSize([width, height], mapData);
            const pathGenerator = d3.geoPath().projection(projection);
            setPathGen(() => pathGenerator);

            const g = svg.append('g').attr('class', 'map-group transition-opacity duration-500');

            g.selectAll('path.state')
                .data(mapData?.features || [])
                .enter()
                .append('path')
                .attr('class', 'state cursor-pointer transition-all duration-300 hover:brightness-110 focus:outline-none focus:ring-2')
                .attr('d', pathGenerator as any)
                .attr('fill', (_d: any, i: number) => {
                    const palette = colors.fill;
                    return palette[i % palette.length];
                })
                .attr('stroke', colors.stroke)
                .attr('stroke-width', '1');

            // Create POI group container once
            svg.append('g').attr('class', 'poi-group transition-opacity duration-500');
        }
    }, [mapData, colors]); // colors dependency to re-render if theme changes? Ideally updates d3 attr.

    // Update click handlers with fresh state
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        svg.selectAll('path.state')
            .on('click', (event, d: any) => {
                event.stopPropagation();
                const stNm = d.properties.st_nm;
                const stateName = STATE_NAME_MAPPING[stNm] || stNm;
                const stateRegion = REGION_MAP[stNm] || 'Unknown';

                console.log('Click on:', stNm, 'Region:', stateRegion, 'ActiveRegion:', activeRegion, 'ActiveState:', activeState);

                if (activeRegion !== stateRegion) {
                    console.log('Switching to region:', stateRegion);
                    onRegionClick(stateRegion);
                } else {
                    console.log('Opening state:', stateName);
                    onStateClick(stateName, stateName);
                }
            });
    }, [activeRegion, activeState, mapData]);

    // Update colors when theme changes
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.selectAll('path.state')
            .attr('fill', (_d: any, i: number) => {
                const palette = colors.fill;
                return palette[i % palette.length];
            })
            .attr('stroke', colors.stroke);

        svg.selectAll('circle.poi')
            .attr('fill', d => (d as any).id === activeMonumentId ? '#dc2626' : colors.poi);

    }, [colors, activeMonumentId]);


    // Styling and Opacity Logic
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        svg.selectAll('path.state').each(function (d: any) {
            const rawStateName = d.properties.st_nm;
            const mappedStateName = STATE_NAME_MAPPING[rawStateName] || rawStateName;
            const stateRegion = REGION_MAP[rawStateName] || 'Unknown';
            const element = d3.select(this);

            if (activeState) {
                if (mappedStateName === activeState) {
                    element.style('opacity', 1).attr('stroke-width', '2');
                } else {
                    element.style('opacity', 0).attr('stroke-width', '0');
                }
            } else if (activeRegion) {
                if (stateRegion === activeRegion) {
                    element.style('opacity', 1).attr('stroke-width', '2');
                } else {
                    element.style('opacity', 0.1).attr('stroke-width', '0.5');
                }
            } else {
                element.style('opacity', 1).attr('stroke-width', '1');
            }
        });

    }, [activeState, activeRegion, mapData]);

    // Zoom Logic
    useEffect(() => {
        if (!svgRef.current || !pathGen || !mapData) return;
        const svg = d3.select(svgRef.current);

        let bounds: [[number, number], [number, number]] | null = null;
        let padding = 20;

        if (activeState) {
            // Find ALL features that map to this activeState (e.g. J&K + Ladakh might both map to "Jammu & Kashmir")
            const features = mapData.features.filter((f: any) => {
                const n = STATE_NAME_MAPPING[f.properties.st_nm] || f.properties.st_nm;
                return n === activeState;
            });

            if (features.length > 0) {
                // To encompass all features, we find the min/max bounds across all of them
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                features.forEach((feature: any) => {
                    const featureBounds = pathGen.bounds(feature);
                    minX = Math.min(minX, featureBounds[0][0]);
                    minY = Math.min(minY, featureBounds[0][1]);
                    maxX = Math.max(maxX, featureBounds[1][0]);
                    maxY = Math.max(maxY, featureBounds[1][1]);
                });

                bounds = [[minX, minY], [maxX, maxY]];

                // Adjust padding to ensure it fits nicely alongside the expanded state info panel
                // On desktop, the panel takes up the right ~53%, so we pad the right side specifically or just
                // overall pad tighter to leave room.
                padding = 20;
            }
        } else if (activeRegion) {
            bounds = regionBounds[activeRegion];
            padding = 120;
        } else {
            // India View (Reset)
            // Hardcoded viewbox for India
            zoomToViewBox(svg, '-20 -140 840 1060');
            return;
        }

        if (bounds) {
            zoomToBounds(svg, bounds, padding);
        }

    }, [activeState, activeRegion, mapData, pathGen, regionBounds]);

    // POI Rendering
    useEffect(() => {
        if (!svgRef.current || !mapData || !pathGen) return;

        // 1. Calculate Target Scale so sizes stay consistent visually when zooming
        let vw = 840;
        if (activeState) {
            const feature = mapData.features.find((f: any) => (STATE_NAME_MAPPING[f.properties.st_nm] || f.properties.st_nm) === activeState);
            if (feature) {
                const bounds = pathGen.bounds(feature);
                const dx = bounds[1][0] - bounds[0][0];
                vw = dx + 20; // smaller padding for state
            }
        } else if (activeRegion) {
            const bounds = regionBounds[activeRegion];
            if (bounds) {
                const dx = bounds[1][0] - bounds[0][0];
                vw = dx + 240; // region padding
            }
        }

        const scale = vw / 840; // 1 for India, e.g. 0.1 for a small state

        // Dynamic base sizes
        const dynRadius = Math.max(0.5, 5 * scale);
        const dynActiveRadius = Math.max(0.8, 8 * scale);
        const dynFontSize = Math.max(1, 14 * scale); // Increased for readability
        const dynLinkDistance = Math.max(1.5, 14 * scale);
        const dynCollideRadius = Math.max(2, 26 * scale);

        // --- Handle dynamic drawing of POIs based on active state ---
        const svgUpdate = d3.select(svgRef.current);
        const poiGroup = svgUpdate.select('g.poi-group');
        const projection = d3.geoMercator().fitSize([800, 850], mapData);

        // Bind new data
        const circles = poiGroup.selectAll('circle.poi').data(pois, (d: any) => d.id);
        const labels = poiGroup.selectAll('text.poi-label').data(pois, (d: any) => d.id);

        circles.exit().transition().duration(300).style('opacity', 0).remove();
        labels.exit().transition().duration(300).style('opacity', 0).remove();

        const circlesEnter = circles.enter()
            .append('circle')
            .attr('class', 'poi cursor-pointer hover:stroke-[3px] transition-all')
            .attr('r', 0)
            .style('opacity', 0)
            .attr('cx', d => projection([d.lon, d.lat])?.[0] || 0)
            .attr('cy', d => projection([d.lon, d.lat])?.[1] || 0)
            .attr('fill', d => d.id === activeMonumentId ? '#dc2626' : colors.poi)
            .attr('stroke', d => d.id === activeMonumentId ? '#ffffff' : colors.poiStroke)
            .attr('stroke-width', d => d.id === activeMonumentId ? 2 * scale : 1 * scale)
            .on('click', (event, d: any) => {
                event.stopPropagation();
                if (onMonumentSelect) onMonumentSelect(d.id);
            });

        circlesEnter.merge(circles as any)
            .transition().duration(800) // Match zoom duration
            .attr('cx', d => projection([d.lon, d.lat])?.[0] || 0)
            .attr('cy', d => projection([d.lon, d.lat])?.[1] || 0)
            .attr('r', d => (d as any).id === activeMonumentId ? dynActiveRadius : dynRadius)
            .attr('fill', d => (d as any).id === activeMonumentId ? '#dc2626' : colors.poi)
            .attr('stroke', d => (d as any).id === activeMonumentId ? '#ffffff' : colors.poiStroke)
            .attr('stroke-width', d => (d as any).id === activeMonumentId ? 2 * scale : 1 * scale)
            .style('opacity', 1);

        // 2. Simulate label physics to prevent overlap & decide multi-direction placement
        // Create an anchor node (fixed) and label node (movable) for each POI
        const nodes: any[] = [];
        const links: any[] = [];

        pois.forEach((d: any) => {
            const coord = projection([d.lon, d.lat]);
            const cx = coord ? coord[0] : 0;
            const cy = coord ? coord[1] : 0;

            // Anchor (fixed POI position)
            const anchor = { id: `anchor_${d.id}`, fx: cx, fy: cy };
            // Label (starts slightly offset to bottom-right by default, then physics takes over)
            const label = { id: d.id, name: d.name, x: cx + dynLinkDistance, y: cy + dynLinkDistance, anchor: true };

            nodes.push(anchor, label);
            links.push({ source: anchor.id, target: label.id });
        });

        if (activeState && pois.length > 0) {
            const sim = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id((d: any) => d.id).distance(dynLinkDistance).strength(1))
                .force('collide', d3.forceCollide().radius((d: any) => d.anchor ? dynCollideRadius : 0).iterations(3)) // labels repel labels
                .force('charge', d3.forceManyBody().strength(-20 * scale)) // Slight repulsion overall
                .stop();

            // Run simulation synchronously
            for (let i = 0; i < 150; ++i) sim.tick();
        }

        const labelMap = new Map();
        nodes.filter(n => n.anchor === true).forEach(n => labelMap.set(n.id, { x: n.x, y: n.y }));

        // Enter + Update Labels
        const labelsEnter = labels.enter()
            .append('text')
            .attr('class', 'poi-label font-bold fill-white/90 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none')
            .style('font-size', `${dynFontSize}px`)
            .style('paint-order', 'stroke fill')
            .style('stroke', 'rgba(0,0,0,0.8)')
            .style('stroke-width', `${2.5 * Math.max(0.5, scale)}px`)
            .style('stroke-linecap', 'round')
            .style('stroke-linejoin', 'round')
            .style('opacity', 0)
            .attr('x', d => projection([d.lon, d.lat])?.[0] || 0)
            .attr('y', d => projection([d.lon, d.lat])?.[1] || 0)
            .attr('text-anchor', d => {
                const pos = labelMap.get((d as any).id);
                const cx = projection([d.lon, d.lat])?.[0] || 0;
                return pos && pos.x < cx ? 'end' : 'start'; // Align left or right depending on which side it landed
            })
            .text(d => d.name);

        labelsEnter.merge(labels as any)
            .transition().duration(800)
            .style('font-size', `${dynFontSize}px`)
            .style('stroke-width', `${2.5 * Math.max(0.5, scale)}px`)
            .attr('x', d => labelMap.get((d as any).id)?.x || 0)
            .attr('y', d => labelMap.get((d as any).id)?.y || 0)
            .attr('text-anchor', d => {
                const pos = labelMap.get((d as any).id);
                const cx = projection([d.lon, d.lat])?.[0] || 0;
                return pos && pos.x < cx ? 'end' : 'start';
            })
            .style('opacity', 1);

        // Show/Hide POI Group
        svgUpdate.select('g.poi-group')
            .transition().duration(800)
            .style('opacity', activeState ? 1 : 0);

    }, [pois, activeState, activeRegion, mapData, colors, activeMonumentId, pathGen]);


    // Helpers
    const zoomToBounds = (svg: any, bounds: [[number, number], [number, number]], padding: number, rightOffset: number = 0) => {
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];

        // Original geometric center of the state
        const cx = (bounds[0][0] + bounds[1][0]) / 2;
        const cy = (bounds[0][1] + bounds[1][1]) / 2;

        // We need to fit the state (dx by dy) into the viewport, but we artificially inflate
        // the required width (vw) to account for the UI panel on the right.
        // If rightOffset > 0, we effectively tell D3 that our "safe area" requires more width.
        const effectiveWidthScale = 1 + rightOffset;

        const vw = (dx + padding * 2) * effectiveWidthScale;
        const vh = dy + padding * 2;

        // Calculate raw top-left
        let vx = cx - vw / 2;
        const vy = cy - vh / 2;

        // The center of our bounding box cx is currently in the absolute middle of the new vw.
        // We want the state (which natively has width `dx`) to be visually centered in the 
        // *left portion* of the screen (the remaining 47%). 
        // To do this, we shift the viewBox X coordinate further negative, pushing the map rightward? 
        // No, we decrease vx to shift the SVG camera left, meaning the map objects move RIGHT on screen. 
        // We actually want the map objects to move LEFT to get out of the way of the right panel.
        // So we INCREASE vx to move the camera right.

        // Shift camera right by half the offset amount to push the content left
        const shiftX = (vw * rightOffset) / 4;
        vx += shiftX;

        zoomToViewBox(svg, `${vx} ${vy} ${vw} ${vh}`);
    };

    const zoomToViewBox = (svg: any, viewBox: string) => {
        svg.transition()
            .duration(800)
            .attrTween('viewBox', function () {
                const currentViewBox = svgRef.current?.getAttribute('viewBox') || '-20 -140 840 1060';
                const i = d3.interpolateString(currentViewBox, viewBox);
                return function (t: number) { return i(t); };
            });
    };

    return (
        <div className="w-full h-full relative flex items-center justify-center bg-transparent">
            {!mapData && (
                <div className="absolute flex flex-col items-center justify-center text-[var(--color-brand-primary)]">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 font-bold animate-pulse text-xl">Loading Map Engine...</p>
                </div>
            )}

            <svg
                ref={svgRef}
                viewBox="-20 -140 840 1060"
                className={`w-full h-full drop-shadow-2xl transition-opacity duration-500 ${mapData ? 'opacity-100' : 'opacity-0'}`}
                style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }}
                onClick={onBackgroundClick}
            >
                <rect width="100%" height="100%" fill="transparent" />
            </svg>
        </div>
    );
};

export default InteractiveMap;

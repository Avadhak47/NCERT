import { useState, useEffect, useMemo, useCallback } from 'react';
import statesData from '../data/states.json'; // Importing directly for now, can be passed as arg

// Types
export type ViewState = 'INDIA' | 'REGION' | 'STATE';
export type MapTheme = 'DEFAULT' | 'HIGH_CONTRAST';

interface MapEngineOptions {
    onStateSelect?: (stateId: string, stateName: string) => void;
    onRegionSelect?: (regionName: string | null) => void;
}

interface POI {
    id: string;
    name: string;
    lat: number;
    lon: number;
    type: 'monument' | 'cluster';
    count?: number;
    x?: number; // D3 Force simulation x
    y?: number; // D3 Force simulation y
}

export const useMapEngine = (options: MapEngineOptions) => {
    const [view, setView] = useState<ViewState>('INDIA');
    const [theme, setTheme] = useState<MapTheme>('DEFAULT');
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    const [activeState, setActiveState] = useState<string | null>(null);
    const [activeMonumentId, setActiveMonumentId] = useState<string | null>(null);
    const [history, setHistory] = useState<ViewState[]>(['INDIA']);

    // Data States
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [pois, setPois] = useState<POI[]>([]);

    // Load GeoJSON
    useEffect(() => {
        fetch('/india-states.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Map Engine: Failed to load map data", err));
    }, []);

    // Color Palettes
    const colors = useMemo(() => {
        if (theme === 'HIGH_CONTRAST') {
            return {
                base: '#000000',
                stroke: '#FFFF00', // Yellow
                fill: ['#000000', '#000000'], // Black
                text: '#FFFFFF',
                highlight: '#00FFFF', // Cyan
                poi: '#FFFFFF',      // White contrasting POI
                poiStroke: '#000000' // Black stroke
            };
        }
        return {
            base: 'transparent',
            stroke: '#ffffff',
            fill: ['#0284c7', '#ea580c', '#16a34a', '#8b5cf6', '#eab308', '#ec4899', '#14b8a6'],
            text: '#ffffff',
            highlight: '#ffffff',
            poi: '#ffffff',      // Change base to white for contrast
            poiStroke: '#0f172a' // Dark slate stroke for high contrast against colorful states
        };
    }, [theme]);

    // Navigation Logic
    const navigateToRegion = useCallback((region: string) => {
        console.log('Hook: navigateToRegion', region);
        setActiveRegion(region);
        setActiveState(null);
        setActiveMonumentId(null);
        setView('REGION');
        // Reset history to just India -> Region (Absolute Navigation)
        setHistory(['INDIA', 'REGION']);
        if (options.onRegionSelect) options.onRegionSelect(region);
    }, [options]);

    const navigateToState = useCallback((stateName: string, stateId: string) => {
        console.log('Hook: navigateToState', stateName, stateId);
        setActiveState(stateName);
        setActiveMonumentId(null);
        setView('STATE');
        setHistory(prev => [...prev, 'STATE']);
        if (options.onStateSelect) options.onStateSelect(stateId, stateName);
    }, [options]);

    const navigateBack = useCallback(() => {
        const newHistory = [...history];
        newHistory.pop(); // Remove current
        const previousView = newHistory[newHistory.length - 1] || 'INDIA';

        setActiveMonumentId(null);

        if (previousView === 'INDIA') {
            setActiveRegion(null);
            setActiveState(null);
            setView('INDIA');
            if (options.onRegionSelect) options.onRegionSelect(null);
            if (options.onStateSelect) options.onStateSelect('', '');
        } else if (previousView === 'REGION' && activeRegion) {
            setActiveState(null);
            setView('REGION');
            if (options.onStateSelect) options.onStateSelect('', '');
        }

        setHistory(newHistory);
    }, [history, activeRegion, options]);


    // POI & Collision Logic
    useEffect(() => {
        if (!activeState) {
            setTimeout(() => setPois([]), 0);
            return;
        }

        const stateRecord = statesData.states.find(s => s.name === activeState);
        if (!stateRecord || !stateRecord.monuments) {
            setTimeout(() => setPois([]), 0);
            return;
        }

        // 1. Raw POIs
        const raw = stateRecord.monuments.map((m: Record<string, unknown>) => ({
            id: m.id as string,
            name: (m.title || m.name) as string,
            lat: m.lat as number,
            lon: m.lon as number,
            type: 'monument' as const
        })).filter((p) => p.lat && p.lon);

        // 2. Clustering
        const grouped: (POI & { items: POI[] })[] = [];
        const THRESHOLD = 0.4;

        raw.forEach((p) => {
            const found = grouped.find(g => Math.abs(g.lat - p.lat) < THRESHOLD && Math.abs(g.lon - p.lon) < THRESHOLD);
            if (found) {
                found.items.push(p);
            } else {
                grouped.push({ ...p, items: [p] });
            }
        });

        // Determine max length for current view
        const maxLength = view === 'STATE' ? 18 : 12;

        const clustered = grouped.map(g => {
            if (g.items.length === 1) return { ...g.items[0], name: truncate(g.items[0].name, maxLength) };
            return {
                id: g.id,
                name: `${truncate(g.items[0].name, maxLength)} (${g.items.length})`,
                lat: g.lat,
                lon: g.lon,
                type: 'cluster' as const,
                count: g.items.length
            };
        });

        setTimeout(() => setPois(clustered), 0);

    }, [activeState, view]);

    const toggleTheme = () => setTheme(prev => prev === 'DEFAULT' ? 'HIGH_CONTRAST' : 'DEFAULT');

    return {
        view,
        theme,
        colors,
        activeRegion,
        activeState,
        activeMonumentId,
        geoData,
        pois,
        actions: {
            navigateToRegion,
            navigateToState,
            navigateBack,
            toggleTheme,
            setActiveRegion,
            setActiveState,
            setActiveMonumentId
        }
    };
};

// Helper
const truncate = (str: string, maxLength: number) => {
    if (!str) return "";
    const name = str.split('-').pop()?.trim() || str;
    const words = name.split(' ').slice(0, 2).join(' ');
    if (words.length > maxLength) {
        return words.substring(0, maxLength - 3) + '...';
    }
    return words;
};

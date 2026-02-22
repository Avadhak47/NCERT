import { useState, useEffect } from 'react';
import InteractiveMap from '../components/map/InteractiveMap';
import StateTile from '../components/core/StateTile';

const ExplorePage = () => {
    const [selectedState, setSelectedState] = useState<{ id: string, name: string } | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    const handleStateSelect = (stateId: string, stateName: string) => {
        if (!stateId) {
            setSelectedState(null);
        } else {
            setSelectedState({ id: stateId, name: stateName });
        }
    };

    const handleRegionSelect = (regionName: string | null) => {
        setSelectedRegion(regionName);
    };

    const handleCloseTile = () => {
        setSelectedState(null);
    };

    // Force main layout navigation to collapse when a state dashboard or region is open
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: !!selectedState || !!selectedRegion } }));
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nav-collapse', { detail: { collapsed: false } }));
            }
        };
    }, [selectedState, selectedRegion]);

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col bg-[var(--color-surface-muted)]">
            {/* Title overlay - Plain text style, hides on region OR state selection */}
            <div className={`absolute top-6 left-6 md:left-12 z-20 pointer-events-none mt-2 transition-all duration-500 ${(selectedState || selectedRegion) ? 'opacity-0 -translate-y-10' : 'opacity-100'}`}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-800 mb-2 drop-shadow-md font-black tracking-tight w-max">Explore Incredible India</h2>
                <p className="text-slate-600 font-bold tracking-wider text-xl drop-shadow-sm">
                    Select a region to zoom in
                </p>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full relative min-h-0 z-0">
                <div className="absolute inset-0 pb-4 pt-16 md:pt-24 flex items-center justify-center">
                    <InteractiveMap
                        onStateSelect={handleStateSelect}
                        onRegionSelect={handleRegionSelect}
                        activeStateId={selectedState?.id || null}
                    />
                </div>
            </div>

            {/* Full Screen State Dashboard Overlay */}
            {selectedState && (
                <div className="absolute inset-0 z-50 bg-white">
                    <StateTile
                        stateId={selectedState.id}
                        stateName={selectedState.name}
                        onClose={handleCloseTile}
                    />
                </div>
            )}
        </div>
    );
};

export default ExplorePage;

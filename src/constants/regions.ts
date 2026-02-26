/**
 * Region and state name mappings for map and explore flow.
 * Aligns GeoJSON st_nm with states.json name where they differ.
 */
export const STATE_NAME_MAPPING: Record<string, string> = {
    'Andaman and Nicobar Islands': 'Andaman & Nicobar',
    'Dadra and Nagar Haveli': 'Dadar & Nagar Haveli',
    'Daman and Diu': 'Daman & Diu',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Odisha': 'Orissa',
    'Uttarakhand': 'Uttarkhand',
    'Ladakh': 'Jammu & Kashmir',
};

export const REGION_MAP: Record<string, string> = {
    'Jammu and Kashmir': 'North',
    'Himachal Pradesh': 'North',
    'Punjab': 'North',
    'Uttarakhand': 'North',
    'Haryana': 'North',
    'Delhi': 'North',
    'Uttar Pradesh': 'North',
    'Chandigarh': 'North',
    'Ladakh': 'North',
    'Rajasthan': 'West',
    'Gujarat': 'West',
    'Maharashtra': 'West',
    'Goa': 'West',
    'Dadra and Nagar Haveli': 'West',
    'Daman and Diu': 'West',
    'Madhya Pradesh': 'Central',
    'Chhattisgarh': 'Central',
    'Bihar': 'East',
    'Jharkhand': 'East',
    'West Bengal': 'East',
    'Odisha': 'East',
    'Andhra Pradesh': 'South',
    'Telangana': 'South',
    'Karnataka': 'South',
    'Kerala': 'South',
    'Tamil Nadu': 'South',
    'Puducherry': 'South',
    'Andaman and Nicobar Islands': 'South',
    'Lakshadweep': 'South',
    'Sikkim': 'Northeast',
    'Assam': 'Northeast',
    'Arunachal Pradesh': 'Northeast',
    'Nagaland': 'Northeast',
    'Manipur': 'Northeast',
    'Mizoram': 'Northeast',
    'Tripura': 'Northeast',
    'Meghalaya': 'Northeast',
};

export const REGIONS = ['North', 'West', 'Central', 'East', 'South', 'Northeast'] as const;

/**
 * Accessible state-level palette (state as fundamental unit).
 * Colorblind-friendly: distinguishable for protanopia, deuteranopia, tritanopia.
 * Varied hue and luminance; avoids red-vs-green-only; moderate saturation for comfort.
 * Suitable for low vision, photophobia, and general accessibility.
 */
export const STATE_PALETTE: readonly string[] = [
    '#4477AA', '#CC6677', '#117733', '#B8A94C', '#66CCEE', '#AA3377', '#AAAAAA', '#DDCC77',
    '#009988', '#BB5522', '#56B4E9', '#E69F00', '#0072B2', '#888888', '#882255', '#88CCAA',
    '#CC99BB', '#6699CC', '#994455', '#AA9944', '#446699', '#997700', '#5599CC', '#AA6699',
    '#666666', '#2C8B2C', '#BB4444', '#DD8833', '#8866AA', '#7A5A4A', '#CC88AA', '#17BECF',
    '#99AA22', '#88BB88', '#AEC7E8', '#EEBB88', '#B8A8C8', '#B8A090', '#E8B8C8', '#88CCDD',
] as const;

/** Sorted list of GeoJSON state names for stable state → index mapping (one color per state). */
export const STATE_NAMES_SORTED = (() => {
    const names = [...new Set(Object.keys(REGION_MAP))];
    names.sort();
    return names;
})();

/** Map GeoJSON state name → palette index (state as unit; consistent across renders). */
export const STATE_TO_PALETTE_INDEX: Record<string, number> = (() => {
    const out: Record<string, number> = {};
    STATE_NAMES_SORTED.forEach((name, i) => { out[name] = i; });
    return out;
})();

/** Region id → list of state names (app display/id format) for that region */
export const REGION_TO_STATES: Record<string, string[]> = (() => {
    const out: Record<string, string[]> = {};
    for (const [geoName, region] of Object.entries(REGION_MAP)) {
        const appName = STATE_NAME_MAPPING[geoName] ?? geoName;
        if (!out[region]) out[region] = [];
        out[region].push(appName);
    }
    return out;
})();

/** State name (app format) → region id (for games) */
export const STATE_TO_REGION: Record<string, string> = (() => {
    const out: Record<string, string> = {};
    for (const [region, states] of Object.entries(REGION_TO_STATES)) {
        states.forEach(s => { out[s] = region; });
    }
    return out;
})();

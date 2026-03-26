export function shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
    const s = shuffle(arr);
    return s.slice(0, Math.min(n, arr.length));
}

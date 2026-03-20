const ABSTRACT_GRADIENT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' fill='%23475569' text-anchor='middle' dy='.3em'%3EVirasat%3C/text%3E%3C/svg%3E`;

const FALLBACK_MAP: Record<string, string> = {};

const DEFAULT = ABSTRACT_GRADIENT;

const TYPE_URLS: Record<string, string> = {};

export function getFallbackImage(title?: string | null, type?: string | null): string {
  if (type && TYPE_URLS[type]) return TYPE_URLS[type];
  if (type && TYPE_URLS[type.toLowerCase()]) return TYPE_URLS[type.toLowerCase()];
  if (!title || typeof title !== 'string') return DEFAULT;
  const t = title.trim();
  for (const [key, url] of Object.entries(FALLBACK_MAP)) {
    if (t.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return DEFAULT;
}

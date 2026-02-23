const FALLBACK_MAP: Record<string, string> = {
  Bhimbetka: 'https://images.unsplash.com/photo-1548013146-7243f490ee0c?w=800&q=80',
  Temple: 'https://images.unsplash.com/photo-1621360241119-c7520141680d?w=800&q=80',
  Dance: 'https://images.unsplash.com/photo-1547153760-18fc949fb6d2?w=800&q=80',
  Monument: 'https://images.unsplash.com/photo-1612438214708-f428a707dd4e?w=800&q=80',
  Painting: 'https://images.unsplash.com/photo-1580126435011-37d457b01b22?w=800&q=80',
  Craft: 'https://images.unsplash.com/photo-1580126435011-37d457b01b22?w=800&q=80',
};

const DEFAULT = 'https://images.unsplash.com/photo-1599839619721-397dd3ebf7f5?w=800&q=80';

const TYPE_URLS: Record<string, string> = {
  monument: 'https://images.unsplash.com/photo-1612438214708-f428a707dd4e?w=800&q=80',
  painting: 'https://images.unsplash.com/photo-1580126435011-37d457b01b22?w=800&q=80',
  'performing arts': 'https://images.unsplash.com/photo-1547153760-18fc949fb6d2?w=800&q=80',
  handicraft: 'https://images.unsplash.com/photo-1580126435011-37d457b01b22?w=800&q=80',
  Festival: 'https://images.unsplash.com/photo-1547153760-18fc949fb6d2?w=800&q=80',
};

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

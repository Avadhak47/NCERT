const BASE = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';

export function getImageUrl(path: string | undefined | null): string {
  if (path == null || path === '') return '';
  const segment = path.startsWith('/') ? path.slice(1) : path;
  const encoded = segment.split('/').map(p => encodeURIComponent(p)).join('/');
  return `${BASE}${encoded}`;
}

export function hasImage(path: string | undefined | null): path is string {
  return typeof path === 'string' && path.trim() !== '';
}

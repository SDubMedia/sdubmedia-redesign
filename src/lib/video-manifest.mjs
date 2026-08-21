// Self-hosted video lookup. src/data/videos.json maps a Vimeo id to the copy
// of that video we host on Cloudflare R2 (uploaded by scripts/encode-upload.mjs).
// Pages keep their Vimeo ids; any id present in the manifest renders the native
// player from R2, any id missing falls back to the Vimeo embed. That makes the
// migration incremental: upload a video, its cards switch over, nothing breaks.
import manifest from '../data/videos.json';

export const VIDEO_BASE = 'https://pub-de3d1d03d535464c8c62813429a5a9ab.r2.dev';

// Accepts a manifest key (for R2-only videos with no Vimeo id), a raw Vimeo
// id, a full link, or 'id/hash'; returns the manifest entry with absolute
// src/poster URLs, or null when the video isn't self-hosted (yet).
export function selfHosted(spec) {
  const key = String(spec ?? '').trim();
  const m = key.match(/(\d+)/);
  const entry = manifest[key] ?? (m ? manifest[m[1]] : null);
  if (!entry) return null;
  return {
    ...entry,
    src: `${VIDEO_BASE}/${entry.file}`,
    poster: `${VIDEO_BASE}/${entry.poster}`,
  };
}

// VideoObject structured data for a self-hosted video. Same contract as
// vimeoVideoLd but built from the manifest, so no network call at build time
// and the contentUrl/thumbnailUrl point at our own domain instead of Vimeo.
export function selfHostedLd(hosted, fallbackTitle = '') {
  const secs = Number(hosted.duration) || 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: fallbackTitle || hosted.title || 'Video',
    description: (hosted.description || fallbackTitle || hosted.title || 'Video by SDub Media').slice(0, 300),
    thumbnailUrl: hosted.poster,
    uploadDate: hosted.uploadDate,
    ...(secs ? { duration: `PT${Math.floor(secs / 60)}M${Math.round(secs % 60)}S` } : {}),
    contentUrl: hosted.src,
    publisher: { '@type': 'Organization', name: 'SDub Media', url: 'https://sdubmedia.com' },
  };
}

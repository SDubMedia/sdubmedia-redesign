// Build-time VideoObject structured data from Vimeo's public oEmbed (no API
// key, same endpoint VideoGrid already uses for thumbnails). Lets Google show
// the site's work as video results. Returns null on any failure: a missing
// schema block is correct degradation, a half-filled one is spam-signal.
//
// Google requires name, thumbnailUrl and uploadDate; duration is recommended.
// oEmbed's upload_date is "YYYY-MM-DD HH:MM:SS" and duration is seconds; both
// are converted to the ISO forms the spec wants.

export async function vimeoVideoLd(spec, fallbackTitle = '') {
  const m = String(spec ?? '').match(/(\d+)(?:\/([0-9a-zA-Z]+))?/);
  if (!m) return null;
  const link = m[2] ? `https://vimeo.com/${m[1]}/${m[2]}` : `https://vimeo.com/${m[1]}`;
  try {
    // referrer= keeps this working for videos whose embed privacy is
    // restricted to sdubmedia.com (oEmbed 404s for them without it).
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(link)}&referrer=${encodeURIComponent('https://sdubmedia.com')}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.thumbnail_url || !d.upload_date) return null;
    const secs = Number(d.duration) || 0;
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: fallbackTitle || d.title || 'Video',
      description: (d.description || fallbackTitle || d.title || 'Video by SDub Media').slice(0, 300),
      thumbnailUrl: d.thumbnail_url,
      uploadDate: d.upload_date.replace(' ', 'T'),
      ...(secs ? { duration: `PT${Math.floor(secs / 60)}M${secs % 60}S` } : {}),
      embedUrl: `https://player.vimeo.com/video/${m[1]}`,
      publisher: { '@type': 'Organization', name: 'SDub Media', url: 'https://sdubmedia.com' },
    };
  } catch { return null; }
}

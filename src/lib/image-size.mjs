// Build-time only. Reads width/height straight from PNG/JPEG headers so
// templates can stamp real width/height attributes on <img> tags (reserving
// layout space, killing CLS) without a manifest to maintain or a dependency.
// Returns null for missing files or unknown formats: callers must degrade to
// emitting no dimension attributes, never guess.
import { readFileSync, existsSync } from 'node:fs';

export function imageDims(publicPath) {
  const file = 'public' + publicPath;
  if (!existsSync(file)) return null;
  const b = readFileSync(file);
  // PNG: dimensions always at a fixed offset in the IHDR chunk
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  // JPEG: walk segments to the first SOF marker
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

// Blog-card thumbnail convention: /images/a/b.jpg -> /images/thumbs/a__b.jpg.
// Falls back to the original when no thumb has been generated, so a new post
// works before scripts/gen-blog-thumbs.py has been run.
export function thumbPath(publicPath) {
  const t = '/images/thumbs/' + publicPath.replace('/images/', '').replaceAll('/', '__');
  return existsSync('public' + t) ? t : publicPath;
}

#!/usr/bin/env node
// Compress a source video for the web, generate a poster frame, upload both
// to the sdubmedia-videos R2 bucket, and record the result in
// src/data/videos.json so the site switches that Vimeo id to the self-hosted
// player on the next build.
//
// Usage:
//   node scripts/encode-upload.mjs <source-file> <vimeoId> <slug> "<title>" [--crf 22] [--height 1080] [--date YYYY-MM-DD]
//
// Defaults: CRF 22 (visually clean), 1080p max, H.264 + AAC, faststart so
// playback begins before the file finishes downloading. Long-form pieces
// should pass a higher --crf (24-25) to keep the file size sane.
// Credentials come from .env.local (gitignored; never commit them).

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[++i];
  else positional.push(args[i]);
}
const [sourceFile, vimeoId, slug, title] = positional;
if (!sourceFile || !vimeoId || !slug || !title) {
  console.error('Usage: node scripts/encode-upload.mjs <source-file> <vimeoId> <slug> "<title>" [--crf 22] [--height 1080] [--date YYYY-MM-DD]');
  process.exit(1);
}
const crf = flags.crf ?? '22';
const maxHeight = Number(flags.height ?? 1080);
const uploadDate = flags.date ?? new Date().toISOString().slice(0, 10);

// .env.local is KEY=VALUE lines; comments and blanks skipped.
const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
for (const k of ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_S3_ENDPOINT', 'R2_BUCKET']) {
  if (!env[k]) { console.error(`Missing ${k} in .env.local`); process.exit(1); }
}

const probe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', sourceFile,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const vStream = probe.streams.find(s => s.codec_type === 'video');
if (!vStream) { console.error('No video stream found in source'); process.exit(1); }
const duration = Math.round(Number(probe.format.duration) || 0);
const srcH = Number(vStream.height) || 1080;
const outH = Math.min(srcH, maxHeight);

const work = mkdtempSync(join(tmpdir(), 'encode-'));
const outMp4 = join(work, `${slug}.mp4`);
const outJpg = join(work, `${slug}.jpg`);

console.log(`Encoding ${sourceFile} -> ${slug}.mp4 (${outH}p, crf ${crf}, ${duration}s)...`);
// Map ONLY the first video + audio stream. Camera .mov files carry timecode/
// metadata tracks that ffmpeg otherwise copies into the mp4, and Chrome's
// demuxer rejects the whole file over the unknown track (readyState stays 0,
// no error). -dn belts-and-suspenders drops any data stream.
execFileSync('ffmpeg', [
  '-y', '-i', sourceFile,
  '-map', '0:v:0', '-map', '0:a:0?', '-dn', '-sn',
  '-map_metadata', '-1',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', crf,
  '-vf', `scale=-2:${outH}`,
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-ac', '2',
  '-movflags', '+faststart',
  outMp4,
], { stdio: ['ignore', 'ignore', 'inherit'] });

// Poster: a frame from a couple of seconds in (or the midpoint of very short
// clips), same width Vimeo thumbnails used.
const posterAt = Math.min(2, Math.max(0, duration / 2)).toFixed(1);
execFileSync('ffmpeg', [
  '-y', '-ss', posterAt, '-i', outMp4,
  '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '3',
  outJpg,
], { stdio: ['ignore', 'ignore', 'ignore'] });

const mb = f => (statSync(f).size / 1024 / 1024).toFixed(1);
console.log(`Encoded: ${mb(outMp4)} MB video, ${mb(outJpg)} MB poster. Uploading...`);

function upload(file, key, type) {
  execFileSync('curl', [
    '-sf', '-o', '/dev/null',
    '-X', 'PUT', '--data-binary', `@${file}`,
    '--aws-sigv4', 'aws:amz:auto:s3',
    '--user', `${env.R2_ACCESS_KEY_ID}:${env.R2_SECRET_ACCESS_KEY}`,
    '-H', `Content-Type: ${type}`,
    '-H', 'Cache-Control: public, max-age=31536000, immutable',
    `${env.R2_S3_ENDPOINT}/${env.R2_BUCKET}/${key}`,
  ], { stdio: 'inherit' });
}
upload(outMp4, `${slug}.mp4`, 'video/mp4');
upload(outJpg, `${slug}.jpg`, 'image/jpeg');

const manifestPath = join(root, 'src/data/videos.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest[vimeoId] = {
  file: `${slug}.mp4`,
  poster: `${slug}.jpg`,
  title,
  duration,
  uploadDate,
  width: Math.round((Number(vStream.width) / srcH) * outH / 2) * 2,
  height: outH,
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
rmSync(work, { recursive: true, force: true });
console.log(`Done. ${vimeoId} -> ${slug}.mp4 recorded in src/data/videos.json`);

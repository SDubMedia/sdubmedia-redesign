#!/usr/bin/env python3
"""Regenerate blog-card thumbnails.

The blog index shows every post's image on one page; serving the full-size
photos there cost 5.7MB for 200px-tall cards. This emits 560px-wide q78
variants into public/images/thumbs/ using the naming convention
/images/a/b.jpg -> thumbs/a__b.jpg (see src/lib/image-size.mjs thumbPath).
Run after changing any post's image: frontmatter, then commit the output.
"""
import glob, re, os
from PIL import Image

os.makedirs('public/images/thumbs', exist_ok=True)
imgs = set()
for f in glob.glob('src/content/blog/*.md'):
    m = re.search(r"^image: '([^']+)'", open(f).read(), re.M)
    if m and not m.group(1).startswith('/images/blog/'):
        imgs.add(m.group(1))
for src in sorted(imgs):
    out = 'public/images/thumbs/' + src.replace('/images/', '').replace('/', '__')
    im = Image.open('public' + src)
    w = 560
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(out, quality=78, optimize=True, progressive=True)
    print(f"{out}: {os.path.getsize(out)//1024}KB")

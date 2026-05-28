#!/bin/bash
# One-off: generate homepage images with gpt-image-1 (matches blog image style).
set -euo pipefail
cd "$(dirname "$0")/.."

KEY=$(grep -oE 'OPENAI_API_KEY=[^ ]+' ~/.hermes/.env | head -1 | cut -d= -f2- | tr -d '"'\''\r')
OUT="public/images/home"
mkdir -p "$OUT"

STYLE="Photorealistic, cinematic, dark moody color grade, shot on a professional cinema camera, shallow depth of field, natural light with soft practical sources. No text, no captions, no watermarks, no logos, no readable brand names, no visible faces of recognizable people."

gen () {
  local name="$1"; local prompt="$2"
  echo "Generating $name ..."
  curl -s https://api.openai.com/v1/images/generations \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg p "$prompt $STYLE" '{model:"gpt-image-1",prompt:$p,n:1,size:"1536x1024",quality:"high"}')" \
    -o "/tmp/img-$name.json" -w "  $name HTTP %{http_code}\n"
  jq -r '.data[0].b64_json' "/tmp/img-$name.json" | base64 -d > "$OUT/$name.png"
  echo "  saved $OUT/$name.png ($(du -h "$OUT/$name.png" | cut -f1))"
}

gen "business" "A small professional video crew filming a confident business owner being interviewed on camera inside a sleek modern Nashville office. A cinema camera on a tripod in the foreground, soft key light, out-of-focus city office behind." &
gen "weddings" "A cinematic wedding videographer filming a couple during golden hour at an elegant outdoor Tennessee venue, warm light, romantic film-like atmosphere, the videographer slightly out of focus in foreground holding a gimbal-stabilized camera." &
gen "recurring" "Behind the scenes of a weekly branded content shoot for a business: a compact crew, a cinema camera on a tripod, LED panels, a subject mid-presentation in a clean studio space, energetic but controlled production environment." &
gen "podcast" "A professional multi-camera podcast studio: two people seated at a table with broadcast microphones on boom arms, warm studio key lighting, acoustic panels, several cinema cameras framing the scene, polished and inviting." &
gen "events" "A professional headshot photography setup in a corporate event space: a studio strobe and softbox lighting a clean neutral backdrop, a camera on a tripod, with the energy of a busy company event softly blurred in the background." &
wait
echo "All done."

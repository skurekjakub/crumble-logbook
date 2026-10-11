#!/usr/bin/env bash
# Writes a 2x2 grid of frames from a boss recording, cropped to the play field, for locating the
# boss against the team. Prints the grid's path.
# Usage: frames.sh <video.mp4> <out.png> [seconds...]   (default seconds: 6 8.5 12 18)
v="$1"; out="$2"; shift 2
if [ $# -eq 0 ]; then ts=(6 8.5 12 18); else ts=("$@"); fi
tmp=$(mktemp -d); ins=()
for t in "${ts[@]}"; do
  ffmpeg -loglevel error -y -ss "$t" -i "$v" -frames:v 1 -vf "crop=1440:1200:0:350,scale=720:-1" "$tmp/$t.png"
  ins+=(-i "$tmp/$t.png")
done
ffmpeg -loglevel error -y "${ins[@]}" -filter_complex "[0][1]hstack[a];[2][3]hstack[b];[a][b]vstack" "$out"
rm -rf "$tmp"; echo "$out"

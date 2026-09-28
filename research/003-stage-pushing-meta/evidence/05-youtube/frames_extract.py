"""Save still frames of a downloaded YouTube video at chosen offsets into its chapters.

Usage:
    python frames_extract.py <video.mp4> <id> <offset_s> [<offset_s> ...]

Reads the chapter list from <id>.info.json beside this script and, for every chapter,
saves the frame nearest chapter start + each offset (seconds, clamped to the chapter)
as frames/<id>-<mmss>.jpg. The video file itself stays outside the repo. Every frame
written gets a line in ../captures.jsonl. Needs PyAV (`import av`).
Failure: an unreadable video raises; a timestamp past the end is skipped.
"""
import datetime, hashlib, json, os, sys
import av

HERE = os.path.dirname(os.path.abspath(__file__))
LEDGER = os.path.join(HERE, "..", "captures.jsonl")


def main(video, vid, offsets):
    """Decode the frames at every chapter start + offset and save them as JPEG."""
    info = json.load(open(os.path.join(HERE, f"{vid}.info.json"), encoding="utf-8"))
    wanted = sorted({min(c["start_time"] + o, c["end_time"] - 1) for c in info["chapters"] for o in offsets})
    os.makedirs(os.path.join(HERE, "frames"), exist_ok=True)
    with av.open(video) as box:
        stream = box.streams.video[0]
        for t in wanted:
            box.seek(int(t / stream.time_base), stream=stream, backward=True)
            frame = next((f for f in box.decode(stream) if f.time is not None and f.time >= t), None)
            if frame is None:
                continue
            name = f"{vid}-{int(t) // 60:02d}{int(t) % 60:02d}.jpg"
            path = os.path.join(HERE, "frames", name)
            frame.to_image().save(path, quality=88)
            data = open(path, "rb").read()
            stamp = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
            with open(LEDGER, "a", encoding="utf-8") as f:
                f.write(json.dumps({"path": f"evidence/05-youtube/frames/{name}",
                                    "url": f"https://www.youtube.com/watch?v={vid}&t={int(t)}s",
                                    "captured_at": stamp, "tool": "python:evidence/05-youtube/frames_extract.py",
                                    "sha256": hashlib.sha256(data).hexdigest()}) + "\n")
            print("saved", name)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]])

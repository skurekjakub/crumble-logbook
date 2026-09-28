import { describe, expect, it } from "vitest";
import { frameName, framesArgs, sheetArgs, showinfoTimes, subsArgs, ytDlpArgs } from "../src/media";

describe("yt-dlp and ffmpeg wrappers", () => {
  it("names frames as frames.py did", () => {
    expect(frameName("p", 65)).toBe("p-01m05.0s.jpg");
    expect(frameName("run", 5.26)).toBe("run-00m05.3s.jpg");
    expect(frameName("run", 600.5)).toBe("run-10m00.5s.jpg");
  });

  it("reads kept frames' times from showinfo", () => {
    const log = [
      "[Parsed_showinfo_2 @ 0x1] n:   0 pts:      0 pts_time:0       duration:1",
      "[Parsed_showinfo_2 @ 0x1] n:   1 pts:     12 pts_time:6.5     duration:1",
    ].join("\n");
    expect(showinfoTimes(log)).toEqual([0, 6.5]);
  });

  it("builds the ffmpeg and yt-dlp command lines", () => {
    expect(ytDlpArgs("https://www.youtube.com/watch?v=x", "d/x.%(ext)s")).toEqual([
      "--no-playlist",
      "--no-progress",
      "-o",
      "d/x.%(ext)s",
      "https://www.youtube.com/watch?v=x",
    ]);
    const frames = framesArgs(
      { video: "v.mp4", t0: 10, t1: 40, step: 0.5, threshold: 6 },
      "f-%05d.jpg",
    );
    expect(frames.slice(1, 7)).toEqual(["-ss", "10", "-t", "30", "-i", "v.mp4"]);
    expect(frames[frames.indexOf("-vf") + 1]).toBe(
      "fps=1/0.5,select='eq(n\\,0)+gt(scene\\,0.0235)',showinfo",
    );
    const sheet = sheetArgs(
      "list.txt",
      { x0: 10, y0: 20, x1: 110, y1: 70, cols: 4, rows: 3 },
      "s-%02d.jpg",
    );
    expect(sheet[sheet.indexOf("-vf") + 1]).toBe("crop=100:50:10:20,tile=4x3");
    const subs = subsArgs({ video: "v.mp4", y0: 600, y1: 680, step: 0.5 }, "s-%02d.jpg");
    expect(subs[subs.indexOf("-vf") + 1]).toMatch(
      /^fps=1\/0\.5,crop=iw-0:80:0:600,select=.*,scale=900:-1,tile=1x14$/,
    );
  });
});

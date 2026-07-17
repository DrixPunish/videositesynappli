#!/usr/bin/env node
/* =============================================================================
   RENDERER — Pilotaction demo video
   Rend studio.html image par image (déterministe) et assemble un MP4 H.264.

   Usage :
     node render.js preview 1000,7000,12000        → preview-<t>.png (QA)
     node render.js render [out.mp4] [fps]         → rendu complet

   Dépendances (résolues via NODE_PATH ou --modules) :
     playwright-core, @ffmpeg-installer/ffmpeg
============================================================================= */
"use strict";
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const MODULES = process.env.STUDIO_MODULES ||
  "/tmp/claude-0/-home-user-videositesynappli/7dc9bb29-037f-5ff4-9971-818e7a0206bd/scratchpad/node_modules";
const { chromium } = require(path.join(MODULES, "playwright-core"));
const FFMPEG = require(path.join(MODULES, "@ffmpeg-installer/ffmpeg")).path;

const EXEC = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const STUDIO = "file://" + path.join(__dirname, "studio.html");
const W = 1920, H = 1080;

async function boot() {
  const browser = await chromium.launch({
    executablePath: EXEC,
    args: ["--no-sandbox", "--disable-gpu", "--force-color-profile=srgb",
           "--disable-lcd-text", "--hide-scrollbars", "--font-render-hinting=none"],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("pageerror", e => { console.error("PAGEERROR:", e.message); process.exitCode = 1; });
  await page.goto(STUDIO, { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", null, { timeout: 15000 });
  const duration = await page.evaluate("window.DURATION");
  return { browser, page, duration };
}

async function preview(times) {
  const { browser, page } = await boot();
  for (const t of times) {
    await page.evaluate(ms => window.seek(ms), t);
    await page.screenshot({ path: path.join(__dirname, `preview-${t}.png`) });
    console.log("preview", t);
  }
  await browser.close();
}

async function render(out, fps) {
  const { browser, page, duration } = await boot();
  const frames = Math.ceil(duration / 1000 * fps);
  console.log(`Rendering ${frames} frames @ ${fps}fps (${(duration/1000).toFixed(1)}s) → ${out}`);

  const ff = spawn(FFMPEG, [
    "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "ignore", "pipe"] });
  let ffLog = "";
  ff.stderr.on("data", d => { ffLog += d; if (ffLog.length > 40000) ffLog = ffLog.slice(-20000); });
  const ffDone = new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg exit " + c + "\n" + ffLog.slice(-3000)))));

  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = Math.min(Math.round(i * 1000 / fps), duration - 1);
    await page.evaluate(ms => window.seek(ms), t);
    const buf = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (i % 150 === 0 || i === frames - 1) {
      const el = (Date.now() - t0) / 1000;
      console.log(`frame ${i + 1}/${frames} (${((i+1)/frames*100).toFixed(0)}%) — ${el.toFixed(0)}s elapsed, ${(el/(i+1)*1000).toFixed(0)}ms/frame`);
    }
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
  const size = fs.statSync(out).size;
  console.log(`DONE: ${out} (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

(async () => {
  const [, , mode, a1, a2] = process.argv;
  if (mode === "preview") {
    await preview((a1 || "1000").split(",").map(Number));
  } else if (mode === "render") {
    await render(a1 || path.join(__dirname, "pilotaction-demo.mp4"), Number(a2) || 30);
  } else {
    console.log("usage: node render.js preview t1,t2,... | render [out.mp4] [fps]");
    process.exit(2);
  }
})().catch(e => { console.error("FATAL", e); process.exit(1); });

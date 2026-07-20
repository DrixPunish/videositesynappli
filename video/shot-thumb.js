const path = require("path");
const MODULES = "/tmp/claude-0/-home-user-videositesynappli/7dc9bb29-037f-5ff4-9971-818e7a0206bd/scratchpad/node_modules";
const { chromium } = require(path.join(MODULES, "playwright-core"));
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox", "--disable-gpu", "--force-color-profile=srgb", "--font-render-hinting=none"] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  await p.goto("file://" + path.join(__dirname, "thumbnail.html"), { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "pilotaction-thumbnail.png" });
  await b.close();
  console.log("done 3840x2160");
})().catch(e => { console.error(e); process.exit(1); });

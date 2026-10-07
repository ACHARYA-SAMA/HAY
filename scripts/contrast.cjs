const { chromium } = require("@playwright/test");
const fs = require("fs");
const out = process.env.AUDIT_OUTPUT ?? "docs";
(async () => {
  const browser = await chromium.launch({
    ...(process.platform === "win32"
      ? {
          executablePath:
            process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
        }
      : {}),
  });
  const p = await browser.newPage({ colorScheme: "dark", viewport: { width: 1440, height: 1000 } });
  const pairs = new Map(),
    failures = [];
  for (const route of [
    "/",
    "/explore",
    "/movies",
    "/events",
    "/sports",
    "/bus",
    "/trains",
    "/flights",
    "/book/coast-rail",
    "/wallet",
    "/ticket/hyd-viz",
  ]) {
    await p.goto((process.env.E2E_URL ?? "http://127.0.0.1:5174") + route, {
      waitUntil: "networkidle",
    });
    await p.waitForFunction(() => window.HAYClicky);
    const data = await p.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      const rgb = (c) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      const luminance = (c) =>
        c
          .slice(0, 3)
          .map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
      const hex = (c) =>
        "#" +
        c
          .slice(0, 3)
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      return [...document.querySelectorAll("body *")]
        .filter(
          (e) =>
            e.getClientRects().length &&
            [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) &&
            !e.closest(':disabled,[aria-disabled="true"],.sr-only'),
        )
        .map((e) => {
          const s = getComputedStyle(e);
          let background = [0, 0, 0, 0],
            parent = e;
          while (parent && background[3] === 0) {
            background = rgb(getComputedStyle(parent).backgroundColor);
            parent = parent.parentElement;
          }
          if (!background[3])
            background = rgb(getComputedStyle(document.documentElement).backgroundColor);
          const foreground = rgb(s.color),
            a = luminance(foreground),
            b = luminance(background),
            ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            large =
              parseFloat(s.fontSize) >= 24 ||
              (parseFloat(s.fontSize) >= 18.66 && parseInt(s.fontWeight) >= 700);
          return {
            text: e.textContent.trim().slice(0, 70),
            foreground: hex(foreground),
            background: hex(background),
            ratio: Math.round(ratio * 100) / 100,
            required: large ? 3 : 4.5,
            selector: e.tagName + "." + e.className,
          };
        });
    });
    for (const r of data) {
      pairs.set(r.foreground + "/" + r.background, { ...r });
      if (r.ratio < r.required) failures.push({ route, ...r });
    }
  }
  await browser.close();
  fs.writeFileSync(
    out + "/contrast.json",
    JSON.stringify({ pairs: [...pairs.values()], failures }, null, 2),
  );
  console.log(JSON.stringify({ pairs: pairs.size, failures }));
  fs.writeFileSync(
    "docs/night-press-contrast.md",
    "# Night Press contrast audit\n\nComputed sRGB contrast from rendered text at 1440px. Body threshold 4.5:1; large type 3:1. Disabled controls excluded. Repeated pairs deduplicated.\n\n| Text | Background | Ratio |\n|---|---|---|\n" +
      [...pairs.values()]
        .map((r) => `| ${r.foreground} | ${r.background} | ${r.ratio}:1 |`)
        .join("\n") +
      "\n\nFailures: " +
      failures.length +
      "\n",
  );
  if (failures.length) process.exitCode = 1;
})();

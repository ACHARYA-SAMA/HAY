/* Adapted from reference/clicky/hay-clicky.js. Client-only, one delegated listener set. */
(() => {
  if (typeof window === "undefined" || window.HAYClicky) return;
  const storageKey = "hay-clicky-sound";
  let sound = false, ctx, pressed, pointerId;
  const popTimers = new Map();
  try { sound = localStorage.getItem(storageKey) === "true"; } catch { /* Storage may be unavailable. */ }
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const audio = () => {
    const Audio = window.AudioContext || window.webkitAudioContext;
    return Audio ? (ctx ||= new Audio()) : undefined;
  };
  function tick(down) {
    if (!sound) return;
    try {
      const c = audio();
      if (!c) return;
      if (c.state === "suspended") void c.resume().catch(() => {});
      const len = Math.floor(c.sampleRate * .03);
      const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf; f.type = "bandpass"; f.frequency.value = down ? 1800 : 1100; f.Q.value = 2;
      g.gain.value = down ? .5 : .25;
      src.connect(f); f.connect(g); g.connect(c.destination); src.start();
    } catch { /* Optional feedback must never interrupt the action. */ }
  }
  const target = e => e.target instanceof Element ? e.target.closest(".clicky") : null;
  const blocked = b => b.matches(':disabled, [aria-disabled="true"], [aria-busy="true"]') || !!b.querySelector("input:disabled");
  const live = e => { const b = target(e); return b && !blocked(b) ? b : null; };
  function cancel() {
    pressed?.classList.remove("is-pressed");
    pressed = undefined; pointerId = undefined;
  }
  function down(b) {
    cancel(); pressed = b; b.classList.remove("pop"); b.classList.add("is-pressed");
    if (!reduced() && navigator.userActivation?.isActive && navigator.vibrate) navigator.vibrate(6);
    tick(true);
  }
  function release(b) {
    cancel();
    if (!b?.isConnected || blocked(b)) return;
    tick(false);
    if (reduced()) return;
    b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    clearTimeout(popTimers.get(b));
    popTimers.set(b, setTimeout(() => { b.classList.remove("pop"); popTimers.delete(b); }, 180));
  }
  const pointerdown = e => { const b = live(e); if (b && e.button === 0 && e.isPrimary) { down(b); pointerId = e.pointerId; } };
  const pointerup = e => { if (e.pointerId !== pointerId) return; const b = pressed; if (live(e) === b) release(b); else cancel(); };
  const keydown = e => {
    const b = live(e);
    if (!b || e.repeat || !["Enter", " "].includes(e.key)) return;
    if (e.target.matches('input:not([type="checkbox"]):not([type="radio"]), select, textarea')) return;
    if (e.key === " " && b.tagName === "A") return;
    down(b);
  };
  const keyup = e => { if (["Enter", " "].includes(e.key) && pressed && live(e) === pressed) release(pressed); };
  const click = e => { const b = target(e); if (b && blocked(b)) { e.preventDefault(); e.stopImmediatePropagation(); } };
  const visibility = () => { if (document.hidden) cancel(); };
  const handlers = { pointerdown, pointerup, pointercancel: cancel, keydown, keyup, click, visibilitychange: visibility };
  for (const [name, handler] of Object.entries(handlers)) document.addEventListener(name, handler, true);
  window.addEventListener("blur", cancel);
  window.HAYClicky = {
    getSound() { return sound; },
    setSound(value) {
      sound = !!value;
      try { localStorage.setItem(storageKey, String(sound)); } catch { /* Keep the session preference. */ }
      if (sound) { try { void audio()?.resume().catch(() => {}); } catch { /* Optional audio. */ } }
      window.dispatchEvent(new Event("hay-clicky-sound-change"));
      return sound;
    },
    destroy() {
      cancel();
      for (const [name, handler] of Object.entries(handlers)) document.removeEventListener(name, handler, true);
      window.removeEventListener("blur", cancel);
      for (const [b, timer] of popTimers) { clearTimeout(timer); b.classList.remove("pop"); }
      popTimers.clear();
      if (ctx) void ctx.close().catch(() => {});
      delete window.HAYClicky;
    },
  };
  window.dispatchEvent(new Event("hay-clicky-ready"));
})();
if (import.meta.hot) import.meta.hot.dispose(() => window.HAYClicky?.destroy());
export {};

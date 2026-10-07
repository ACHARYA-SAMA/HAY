/* hay-clicky.js: haptic tick, optional synthesized click sound, release pop.
   No assets, no deps. Sound is OFF by default: HAYClicky.setSound(true) to enable.
   In Next.js, import it once from a client component (useEffect) or the root layout. */
(() => {
  if (window.HAYClicky) return;
  let sound = false, ctx;
  const audio = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

  function tick(down) {
    if (!sound) return;
    const c = audio(), len = Math.floor(c.sampleRate * 0.03);
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = down ? 1800 : 1100; f.Q.value = 2;
    g.gain.value = down ? 0.5 : 0.25;
    src.connect(f); f.connect(g); g.connect(c.destination); src.start();
  }

  const live = (e) => {
    const b = e.target.closest && e.target.closest(".clicky");
    return b && !b.disabled && b.getAttribute("aria-disabled") !== "true" ? b : null;
  };

  document.addEventListener("pointerdown", (e) => {
    if (!live(e)) return;
    if (navigator.vibrate) navigator.vibrate(6);
    tick(true);
  });
  document.addEventListener("pointerup", (e) => {
    const b = live(e);
    if (!b) return;
    tick(false);
    b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
  });
  document.addEventListener("animationend", (e) => e.target.classList && e.target.classList.remove("pop"));

  window.HAYClicky = { setSound(v) { sound = !!v; if (sound) audio().resume(); } };
})();

export type DesignerSession = {
  stop: () => void;
};

const VOICE_LINE = "tell me one thing you want this week.";

/**
 * Pick the most natural-sounding system voice available. Prefers
 * higher-quality synthesizers shipped with macOS / iOS / Edge.
 */
function pickBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en/.test(v.lang));
  // Highest-quality named voices common across platforms
  const preferredNames = [
    "Samantha", // macOS premium
    "Allison",
    "Ava",
    "Karen",
    "Moira",
    "Serena",
    "Tessa",
    "Microsoft Aria Online (Natural)",
    "Microsoft Jenny Online (Natural)",
    "Google US English",
  ];
  for (const name of preferredNames) {
    const match = en.find((v) => v.name === name || v.name.includes(name));
    if (match) return match;
  }
  // Fall back to any en-US local voice, or any en voice
  return (
    en.find((v) => v.lang === "en-US" && v.localService) ||
    en.find((v) => v.lang === "en-US") ||
    en[0] ||
    voices[0]
  );
}

/**
 * Speak the designer's signature line via SpeechSynthesis. Drives the
 * orb's listen level via timed envelope (the API doesn't expose audio
 * to Web Audio in most browsers, so we approximate with onstart /
 * onboundary events).
 *
 * Returns null if SpeechSynthesis isn't available — caller should fall
 * back to playDesigner (procedural pad).
 */
export async function speakDesigner(
  onLevel: (level: number) => void,
  onComplete: () => void,
): Promise<DesignerSession | null> {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  // Voices may not be loaded yet on first paint; await voiceschanged briefly.
  if (!window.speechSynthesis.getVoices().length) {
    await new Promise<void>((resolve) => {
      const t = setTimeout(resolve, 300);
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          clearTimeout(t);
          resolve();
        },
        { once: true },
      );
    });
  }

  const voice = pickBestVoice();
  if (!voice) return null;

  const utter = new SpeechSynthesisUtterance(VOICE_LINE);
  utter.voice = voice;
  utter.rate = 0.92;
  utter.pitch = 0.96;
  utter.volume = 1;

  let stopped = false;
  let raf = 0;
  let phase = 0; // 0..1 envelope position
  let startTime = 0;
  // Estimated speaking duration in ms — roughly 380ms per word at rate=0.92
  const wordCount = VOICE_LINE.split(/\s+/).length;
  const estDuration = (wordCount * 380) / utter.rate;

  function envelope(t: number): number {
    // attack 200ms, sustain with subtle wobble, release 350ms
    if (t < 0.05) return t / 0.05;
    if (t > 0.92) return Math.max(0, (1 - t) / 0.08);
    return 0.7 + 0.25 * Math.sin(t * 14);
  }

  function tick(now: number) {
    if (stopped) return;
    if (!startTime) startTime = now;
    const t = Math.min(1, (now - startTime) / estDuration);
    const level = envelope(t) * 0.85;
    onLevel(level);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    }
  }

  utter.onstart = () => {
    raf = requestAnimationFrame(tick);
  };
  utter.onend = () => {
    if (!stopped) {
      stopped = true;
      cancelAnimationFrame(raf);
      onLevel(0);
      onComplete();
    }
  };
  utter.onerror = () => {
    if (!stopped) {
      stopped = true;
      cancelAnimationFrame(raf);
      onLevel(0);
      onComplete();
    }
  };

  // Some browsers gate speech behind user gesture — caller already in click handler.
  window.speechSynthesis.speak(utter);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      window.speechSynthesis.cancel();
      onLevel(0);
    },
  };
}

/**
 * Build a procedural "presence" pad with two slightly detuned sines, a
 * triangle harmonic, lowpass filter, and a swell envelope. Routes through
 * an AnalyserNode so the caller can read the live amplitude and pulse
 * the orb in sync.
 *
 * Total duration ≈ 6 seconds. `onLevel(0..1)` is called at animation-frame
 * rate while the pad plays. `onComplete()` fires once the release tail ends.
 */
export async function playDesigner(
  onLevel: (level: number) => void,
  onComplete: () => void,
): Promise<DesignerSession> {
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const ac: AudioContext = new AC();
  if (ac.state === "suspended") await ac.resume();

  const dest = ac.destination;
  const master = ac.createGain();
  const analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.8;
  master.connect(analyser);
  analyser.connect(dest);

  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 1.4;
  filter.connect(master);

  // Two detuned low sines for warmth + a slow beat.
  const osc1 = ac.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 130;
  osc1.connect(filter);

  const osc2 = ac.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 130.6;
  osc2.connect(filter);

  // A high triangle for shimmer, mixed in low.
  const osc3 = ac.createOscillator();
  osc3.type = "triangle";
  osc3.frequency.value = 392;
  const osc3Gain = ac.createGain();
  osc3Gain.gain.value = 0.05;
  osc3.connect(osc3Gain);
  osc3Gain.connect(filter);

  const now = ac.currentTime;
  const attack = 1.2;
  const sustain = 3.5;
  const release = 1.6;
  const total = attack + sustain + release;

  // Master amplitude envelope.
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.18, now + attack);
  master.gain.linearRampToValueAtTime(0.16, now + attack + sustain);
  master.gain.linearRampToValueAtTime(0, now + total);

  // Filter "breath" — opens then closes.
  filter.frequency.setValueAtTime(380, now);
  filter.frequency.linearRampToValueAtTime(950, now + attack + sustain * 0.5);
  filter.frequency.linearRampToValueAtTime(420, now + total);

  [osc1, osc2, osc3].forEach((o) => {
    o.start(now);
    o.stop(now + total + 0.1);
  });

  const buf = new Float32Array(analyser.fftSize);
  let smoothed = 0;
  let raf = 0;
  let stopped = false;

  function tick() {
    if (stopped) return;
    analyser.getFloatTimeDomainData(buf);
    let sumSq = 0;
    for (let i = 0; i < buf.length; i++) {
      const s = buf[i];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / buf.length);
    // pad RMS is in 0.05..0.18 range; map to 0.2..1.0 so the orb breathes
    const target = Math.min(1, 0.2 + rms * 4.5);
    smoothed += (target - smoothed) * 0.18;
    onLevel(smoothed);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  function cleanup() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    onLevel(0);
    void ac.close();
  }

  // Schedule the natural completion handler.
  const completeTimer = setTimeout(() => {
    cleanup();
    onComplete();
  }, total * 1000 + 80);

  return {
    stop() {
      clearTimeout(completeTimer);
      cleanup();
    },
  };
}

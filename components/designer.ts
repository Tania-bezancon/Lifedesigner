export type DesignerSession = {
  stop: () => void;
};

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

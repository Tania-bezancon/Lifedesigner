export type MicSession = {
  stop: () => void;
};

/**
 * Request microphone access and stream a smoothed 0..1 amplitude level
 * to `onLevel` at animation-frame rate. Throws if permission is denied
 * or the API is unavailable.
 */
export async function startMic(
  onLevel: (level: number) => void,
): Promise<MicSession> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("mic-unavailable");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
    },
  });

  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const ac: AudioContext = new AC();
  // Some browsers start AudioContext suspended until a user gesture chain.
  if (ac.state === "suspended") await ac.resume();

  const src = ac.createMediaStreamSource(stream);
  const analyser = ac.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.85;
  src.connect(analyser);

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
    // Map a typical speaking RMS (~0.05–0.3) up to ~1, with a soft floor
    // so the orb doesn't read silence as zero (keeps a baseline glow).
    const target = Math.min(1, 0.18 + rms * 4.2);
    smoothed += (target - smoothed) * 0.22;
    onLevel(smoothed);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ac.close();
    },
  };
}

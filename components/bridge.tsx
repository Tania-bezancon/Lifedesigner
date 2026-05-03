"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

const WORDS = [
  { label: "listening", trail: "..." },
  { label: "rendering", trail: "..." },
  { label: "done.", trail: "" },
];

/**
 * A short cinematic breath between the hero and the YourTurn moment.
 * Three monospace words stagger in as the section enters the viewport
 * — `listening...`, `rendering...`, `done.` — over ~3 seconds. No
 * imagery; the section's only job is to give the page a beat and to
 * preview what the designer is about to do.
 */
export function Bridge() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    function play() {
      if (playedRef.current) return;
      playedRef.current = true;
      // stagger the three words in
      WORDS.forEach((_, i) => {
        setTimeout(
          () => {
            setVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          },
          i * 900 + 200,
        );
      });
    }

    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) play();
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.sBridge} id="presence">
      <span className={styles.bridgeEyebrow}>presence.calibrate()</span>

      <div className={styles.bridgeHalo} aria-hidden="true" />

      <div className={styles.bridgeStack} aria-hidden="true">
        {WORDS.map((w, i) => (
          <div
            key={w.label}
            className={`${styles.bridgeWord} ${visible[i] ? styles.bridgeWordIn : ""} ${
              i === WORDS.length - 1 ? styles.bridgeWordDone : ""
            }`}
          >
            <span className={styles.bridgeWordLabel}>{w.label}</span>
            <span className={styles.bridgeWordTrail}>{w.trail}</span>
          </div>
        ))}
      </div>

      <a className={styles.bridgeCta} href="#your-turn">
        ↓ tell me one thing
      </a>
    </section>
  );
}

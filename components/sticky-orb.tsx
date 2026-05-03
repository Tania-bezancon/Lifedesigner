"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";

/**
 * A small orb that sits in the bottom-right corner of the viewport
 * and fades in once the hero scrolls out of view. Pulses gently with
 * scroll progress so the visitor feels the designer's presence
 * continuing past the hero.
 */
export function StickyOrb() {
  const orbRef = useRef<OrbHandle>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  // Show after we've scrolled at least one viewport past the hero,
  // hide once the footer comes into view.
  useEffect(() => {
    function update() {
      const vh = window.innerHeight;
      const sY = window.scrollY;
      const sH = document.documentElement.scrollHeight;
      const passedHero = sY > vh * 0.85;
      const nearFooter = sY + vh > sH - 180;
      setActive(passedHero && !nearFooter);

      // ambient breath: tiny pulse based on scroll position
      const max = Math.max(1, sH - vh);
      const p = Math.min(1, Math.max(0, sY / max));
      // 0.25..0.5 oscillating with scroll, gentle
      orbRef.current?.setListen(0.25 + p * 0.25);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`${styles.stickyOrb} ${active ? styles.stickyOrbActive : ""}`}
      aria-hidden="true"
    >
      <OrbCanvas ref={orbRef} radius={0.36} />
    </div>
  );
}

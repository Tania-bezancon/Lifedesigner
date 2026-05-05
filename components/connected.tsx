"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

const INTEGRATIONS = [
  {
    name: "gmail",
    color: "#ea4335",
    reading: "47 unread · 12 from work · sent at 23:14 last night",
  },
  {
    name: "calendar",
    color: "#4285f4",
    reading: "14 meetings/wk · 3.2h focus · 0 saturday plans",
  },
  {
    name: "slack",
    color: "#611f69",
    reading: "active 14h/day · last reply at 22:38",
  },
  {
    name: "health",
    color: "#fa3c4c",
    reading: "8,200 steps avg · last 5k: 2y ago · sleep: 6h12",
  },
];

const VISION = [
  "the air is cold.",
  "i hear my breath.",
  "i&apos;m at kilometer seven.",
  "my body knows what to do.",
  "that&apos;s the version of me i want back.",
];

export function Connected() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [visionVisible, setVisionVisible] = useState(false);
  const [showVision, setShowVision] = useState<boolean[]>(() =>
    VISION.map(() => false),
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      setVisionVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.16 },
    );
    io.observe(el);

    // Once revealed, slowly reveal each line of the vision after the question lands.
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const start = setTimeout(() => setVisionVisible(true), 1400);
    return () => clearTimeout(start);
  }, [revealed]);

  useEffect(() => {
    if (!visionVisible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    VISION.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => {
            setShowVision((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          },
          i * 700 + 200,
        ),
      );
    });
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [visionVisible]);

  return (
    <section ref={sectionRef} className={styles.sConnected} id="connected">
      <div className={styles.connectedHead}>
        <span className={styles.techLabel}>presence.connect()</span>
        <span className={styles.connectedSubLabel}>
          authorized · <span className={styles.tnum}>2026-05-04</span> ·
          read-only
        </span>
      </div>

      <h2
        className={`${styles.display} ${styles.connectedHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        first, it
        <br />
        <span className={styles.it}>read her week.</span>
      </h2>

      <ol className={styles.integrationGrid}>
        {INTEGRATIONS.map((int, i) => (
          <li
            key={int.name}
            className={`${styles.integration} ${
              revealed ? styles.in : styles.reveal
            }`}
            style={{ transitionDelay: `${200 + i * 90}ms` }}
          >
            <span
              className={styles.integrationDot}
              style={{ background: int.color }}
              aria-hidden="true"
            />
            <span className={styles.integrationName}>{int.name}</span>
            <span className={styles.integrationReading}>{int.reading}</span>
          </li>
        ))}
      </ol>

      <div className={styles.connectedAsk}>
        <span className={styles.connectedAskLabel}>
          then it asked her one question.
        </span>
        <p
          className={`${styles.connectedAskQuestion} ${
            revealed ? styles.in : styles.reveal
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          imagine — saturday morning, in your dream life.
          <br />
          <span className={styles.connectedAskSub}>
            what does it feel like?
          </span>
        </p>
      </div>

      <div
        className={styles.connectedVision}
        aria-live="polite"
      >
        <span className={styles.connectedVisionWho}>maria · whispered</span>
        <div className={styles.connectedVisionLines}>
          {VISION.map((line, i) => (
            <p
              key={i}
              className={`${styles.connectedVisionLine} ${
                showVision[i] ? styles.in : ""
              }`}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

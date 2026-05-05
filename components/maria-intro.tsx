"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

const STATS = [
  { label: "average bedtime", value: "12:43", trend: "+1h47 vs january" },
  { label: "last 5k", value: "2 years", trend: "since the move" },
  { label: "slack active", value: "14h / day", trend: "peaks at 22:00" },
  { label: "saturday mornings", value: "in bed", trend: "8 weeks running" },
];

export function MariaIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
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
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.sMaria} id="maria">
      <div className={styles.mariaHead}>
        <span className={styles.techLabel}>case.001</span>
        <span className={styles.mariaMeta}>
          maria · <span className={styles.tnum}>31</span> · brooklyn ·
          product designer
        </span>
      </div>

      <div className={styles.mariaGrid}>
        <div
          className={`${styles.mariaQuote} ${
            revealed ? styles.in : styles.reveal
          }`}
        >
          <h2 className={`${styles.display} ${styles.mariaQuoteHeadline}`}>
            she lost
            <br />
            <span className={styles.it}>the rhythm.</span>
          </h2>
          <blockquote className={styles.mariaQuoteBody}>
            <p>
              &ldquo;i used to run ten kilometers every saturday. now i can
              barely get out of bed before nine. i don&apos;t recognize my own
              week.&rdquo;
            </p>
            <cite>— maria, six months after the move</cite>
          </blockquote>
        </div>

        <ol className={styles.mariaStats}>
          {STATS.map((s, i) => (
            <li
              key={s.label}
              className={`${styles.mariaStat} ${
                revealed ? styles.in : styles.reveal
              }`}
              style={{ transitionDelay: `${200 + i * 110}ms` }}
            >
              <span className={styles.mariaStatLabel}>{s.label}</span>
              <span className={styles.mariaStatValue}>{s.value}</span>
              <span className={styles.mariaStatTrend}>{s.trend}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

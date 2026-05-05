"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { useT } from "@/lib/i18n";

export function MariaIntro() {
  const t = useT();
  const STATS = [
    {
      label: t("mariaStat1Label"),
      value: t("mariaStat1Value"),
      trend: t("mariaStat1Trend"),
    },
    {
      label: t("mariaStat2Label"),
      value: t("mariaStat2Value"),
      trend: t("mariaStat2Trend"),
    },
    {
      label: t("mariaStat3Label"),
      value: t("mariaStat3Value"),
      trend: t("mariaStat3Trend"),
    },
    {
      label: t("mariaStat4Label"),
      value: t("mariaStat4Value"),
      trend: t("mariaStat4Trend"),
    },
  ];
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
        <span className={styles.techLabel}>{t("mariaCaseLabel")}</span>
        <span className={styles.mariaMeta}>{t("mariaMeta")}</span>
      </div>

      <div className={styles.mariaGrid}>
        <div
          className={`${styles.mariaQuote} ${
            revealed ? styles.in : styles.reveal
          }`}
        >
          <h2 className={`${styles.display} ${styles.mariaQuoteHeadline}`}>
            {t("mariaHeadline1")}
            <br />
            <span className={styles.it}>{t("mariaHeadline2")}</span>
          </h2>
          <blockquote className={styles.mariaQuoteBody}>
            <p>&ldquo;{t("mariaQuote")}&rdquo;</p>
            <cite>{t("mariaQuoteAttr")}</cite>
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

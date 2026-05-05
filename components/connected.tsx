"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { useT } from "@/lib/i18n";

const INTEGRATION_KEYS = [
  "gmail",
  "calendar",
  "slack",
  "notion",
  "health",
  "strava",
] as const;

const INTEGRATIONS_DATA: Record<
  (typeof INTEGRATION_KEYS)[number],
  { color: string; reads: { en: string; fr: string }; writes: { en: string; fr: string } }
> = {
  gmail: {
    color: "#ea4335",
    reads: {
      en: "47 unread · sent at 23:14 last night",
      fr: "47 non lus · envoyé à 23h14 hier soir",
    },
    writes: {
      en: "snoozes work threads after 21:00",
      fr: "met en pause les fils pro après 21h",
    },
  },
  calendar: {
    color: "#4285f4",
    reads: {
      en: "14 meetings/wk · 3.2h focus · 0 saturday plans",
      fr: "14 réunions/sem · 3,2h focus · 0 plan le samedi",
    },
    writes: {
      en: "blocks 'walk · 20 min' every monday at 07:12",
      fr: "bloque 'marche · 20 min' chaque lundi à 07h12",
    },
  },
  slack: {
    color: "#611f69",
    reads: {
      en: "active 14h/day · last reply at 22:38",
      fr: "actif 14h/jour · dernière réponse à 22h38",
    },
    writes: {
      en: "sets do-not-disturb during your runs",
      fr: "active dnd pendant tes courses",
    },
  },
  notion: {
    color: "#000000",
    reads: {
      en: "q3 goals · weekly review template · running log",
      fr: "objectifs t3 · template de revue · journal de course",
    },
    writes: {
      en: "drops 'sunday review · 10 min, out loud' every week",
      fr: "ajoute 'revue dominicale · 10 min à voix haute' chaque semaine",
    },
  },
  health: {
    color: "#fa3c4c",
    reads: {
      en: "8,200 steps avg · last 5k 2y ago · sleep 6h12",
      fr: "8 200 pas/jour · dernier 5k il y a 2 ans · sommeil 6h12",
    },
    writes: {
      en: "shortens runs after a bad night's sleep",
      fr: "raccourcit les sorties après une mauvaise nuit",
    },
  },
  strava: {
    color: "#fc4c02",
    reads: {
      en: "weekly km · best 5k pace · effort score",
      fr: "km hebdo · meilleur 5k · score d'effort",
    },
    writes: {
      en: "schedules sunday recovery after a long run",
      fr: "planifie la récup du dimanche après une sortie longue",
    },
  },
};

const VISION_KEYS = [
  "connectedVisionLine1",
  "connectedVisionLine2",
  "connectedVisionLine3",
  "connectedVisionLine4",
  "connectedVisionLine5",
] as const;

export function Connected() {
  const t = useT();
  // We need the language to pick the correct integration text.
  // Read it from the html attribute (set by the i18n provider).
  const [lang, setLang] = useState<"en" | "fr">("en");

  useEffect(() => {
    const update = () => {
      const v = document.documentElement.getAttribute("data-lang");
      setLang(v === "fr" ? "fr" : "en");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-lang"],
    });
    return () => observer.disconnect();
  }, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [visionVisible, setVisionVisible] = useState(false);
  const [showVision, setShowVision] = useState<boolean[]>(() =>
    VISION_KEYS.map(() => false),
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
    VISION_KEYS.forEach((_, i) => {
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
        <span className={styles.techLabel}>{t("connectedTechLabel")}</span>
        <span className={styles.connectedSubLabel}>{t("connectedSub")}</span>
      </div>

      <h2
        className={`${styles.display} ${styles.connectedHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        {t("connectedHeadline1")}
        <br />
        <span className={styles.it}>{t("connectedHeadline2")}</span>
      </h2>

      <ol className={styles.integrationGrid}>
        {INTEGRATION_KEYS.map((key, i) => {
          const data = INTEGRATIONS_DATA[key];
          return (
            <li
              key={key}
              className={`${styles.integration} ${
                revealed ? styles.in : styles.reveal
              }`}
              style={{ transitionDelay: `${200 + i * 80}ms` }}
            >
              <div className={styles.integrationHeader}>
                <span
                  className={styles.integrationDot}
                  style={{ background: data.color }}
                  aria-hidden="true"
                />
                <span className={styles.integrationName}>{key}</span>
              </div>
              <div className={styles.integrationStream}>
                <div className={styles.integrationStreamRow}>
                  <span className={styles.integrationStreamLabel}>
                    {t("connectedReads")}
                  </span>
                  <span className={styles.integrationStreamText}>
                    {data.reads[lang]}
                  </span>
                </div>
                <div className={styles.integrationStreamRow}>
                  <span
                    className={`${styles.integrationStreamLabel} ${styles.integrationStreamLabelWrite}`}
                  >
                    {t("connectedWrites")}
                  </span>
                  <span
                    className={`${styles.integrationStreamText} ${styles.integrationStreamTextWrite}`}
                  >
                    {data.writes[lang]}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className={styles.connectedActions}>
        <span className={styles.connectedActionsLabel}>
          {t("connectedActionsLabel")}
        </span>
        <ol className={styles.connectedActionsList}>
          <li>
            <span className={styles.connectedActionDot} aria-hidden="true" />
            <span>{t("connectedAction1")}</span>
          </li>
          <li>
            <span className={styles.connectedActionDot} aria-hidden="true" />
            <span>{t("connectedAction2")}</span>
          </li>
          <li>
            <span className={styles.connectedActionDot} aria-hidden="true" />
            <span>{t("connectedAction3")}</span>
          </li>
        </ol>
      </div>

      <div className={styles.connectedAsk}>
        <span className={styles.connectedAskLabel}>{t("connectedAskLabel")}</span>
        <p
          className={`${styles.connectedAskQuestion} ${
            revealed ? styles.in : styles.reveal
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          {t("connectedAskQuestion1")}
          <br />
          {t("connectedAskQuestion2")}
          <br />
          <span className={styles.connectedAskSub}>{t("connectedAskSub")}</span>
        </p>
      </div>

      <div className={styles.connectedVision} aria-live="polite">
        <span className={styles.connectedVisionWho}>
          {t("connectedVisionWho")}
        </span>
        <div className={styles.connectedVisionLines}>
          {VISION_KEYS.map((key, i) => (
            <p
              key={key}
              className={`${styles.connectedVisionLine} ${
                showVision[i] ? styles.in : ""
              }`}
            >
              {t(key)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

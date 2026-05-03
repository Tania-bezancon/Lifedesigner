"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

type Line = { who: "you" | "des"; label: string; text: string };

const TRANSCRIPT: Line[] = [
  {
    who: "you",
    label: "you",
    text: "i can't seem to get back to a healthier life.",
  },
  {
    who: "des",
    label: "the designer",
    text: "okay. what does 'healthier' feel like, when it works?",
  },
  {
    who: "you",
    label: "you",
    text: "sleep at eleven. walk before email. fewer pings.",
  },
  {
    who: "des",
    label: "the designer",
    text: "three things. easy to keep — even on a bad day.",
  },
  {
    who: "you",
    label: "you",
    text: "even the third?",
  },
  {
    who: "des",
    label: "the designer",
    text: "slack opens at 09:30 — not a moment before. starting monday.",
  },
];

const PILLARS = [
  {
    eyebrow: "01",
    title: "speak freely",
    body: "the designer listens — it doesn't interrupt, doesn't suggest until you stop.",
  },
  {
    eyebrow: "02",
    title: "remembered",
    body: "it knows your last four mondays. the rules grow with you, not against you.",
  },
  {
    eyebrow: "03",
    title: "rendered",
    body: "you don't get advice. you get a week — concrete, modest, on monday.",
  },
];

export function Concept() {
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
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.sConcept} id="concept">
      <div className={styles.conceptHead}>
        <span className={styles.techLabel}>concept.see()</span>
        <span className={styles.conceptVersion}>
          v0.3 · transcript · <span className={styles.tnum}>03:14</span>
        </span>
      </div>

      <h2
        className={`${styles.display} ${styles.conceptHeadline} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        first, you talk.
        <br />
        <span className={styles.it}>then, it renders.</span>
      </h2>

      <div className={styles.conceptGrid}>
        <div
          className={`${styles.conceptDialog} ${
            revealed ? styles.in : styles.reveal
          }`}
        >
          <div className={styles.conceptDialogMeta}>
            <span className={styles.conceptDialogChip}>
              <span className={styles.conceptDialogPip} aria-hidden="true" />
              live · sample
            </span>
            <span className={styles.conceptDialogTime}>
              session · <span className={styles.tnum}>03m 14s</span>
            </span>
          </div>
          <div className={styles.conceptDialogBody}>
            {TRANSCRIPT.map((line, i) => (
              <div
                key={i}
                className={`${styles.conceptLine} ${
                  line.who === "des" ? styles.conceptLineDes : ""
                }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className={styles.conceptLineWho}>{line.label}</span>
                <span className={styles.conceptLineText}>{line.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.conceptAside}>
          <p className={styles.conceptAsideQuiet}>
            the designer is not a chatbot. it&apos;s a structured listener
            that turns a feeling into a week — without prescribing, without
            judging, without ever raising its voice.
          </p>
          <ol className={styles.conceptPillars}>
            {PILLARS.map((p, i) => (
              <li
                key={p.title}
                className={`${styles.conceptPillar} ${
                  revealed ? styles.in : styles.reveal
                }`}
                style={{ transitionDelay: `${250 + i * 110}ms` }}
              >
                <span className={styles.conceptPillarNum}>{p.eyebrow}</span>
                <h3 className={styles.conceptPillarTitle}>{p.title}</h3>
                <p className={styles.conceptPillarBody}>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div
        className={`${styles.conceptStats} ${
          revealed ? styles.in : styles.reveal
        }`}
      >
        <span className={styles.conceptStat}>
          <span className={styles.conceptStatNum}>3m 14s</span>
          <span className={styles.conceptStatLabel}>median session</span>
        </span>
        <span className={styles.conceptStatSep} />
        <span className={styles.conceptStat}>
          <span className={styles.conceptStatNum}>12</span>
          <span className={styles.conceptStatLabel}>words per reply</span>
        </span>
        <span className={styles.conceptStatSep} />
        <span className={styles.conceptStat}>
          <span className={styles.conceptStatNum}>1,247</span>
          <span className={styles.conceptStatLabel}>weeks this season</span>
        </span>
        <span className={styles.conceptStatSep} />
        <span className={styles.conceptStat}>
          <span className={styles.conceptStatNum}>0</span>
          <span className={styles.conceptStatLabel}>notifications</span>
        </span>
      </div>
    </section>
  );
}

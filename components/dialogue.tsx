"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";

type Speaker = "sarah" | "des";
type Line = { who: Speaker; label: string; text: string };

const SCRIPT: Line[] = [
  { who: "sarah", label: "sarah", text: "i sleep badly. i've lost my rhythm." },
  { who: "des", label: "the designer", text: "what would a good week look like?" },
  {
    who: "sarah",
    label: "sarah",
    text: "waking up without an alarm. reading a little. seeing lea again.",
  },
  {
    who: "des",
    label: "the designer",
    text: "okay. we'll start gently — monday, seven a.m.",
  },
];

type RenderedLine = Line & {
  id: number;
  shown: string;
  typing: boolean;
  state: "in" | "out";
};

export function Dialogue({
  onDesignerListening,
}: {
  onDesignerListening?: (active: boolean) => void;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const runIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idCounterRef = useRef(0);
  const playedRef = useRef(false);
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function wait(ms: number, runId: number) {
    return new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        if (runId === runIdRef.current) resolve();
      }, ms);
      timersRef.current.push(t);
    });
  }

  function setActive(who: Speaker | null) {
    setActiveSpeaker(who);
    onDesignerListening?.(who === "des");
  }

  function typewriter(id: number, text: string, charDelay: number, runId: number) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const step = () => {
        if (runId !== runIdRef.current) {
          resolve();
          return;
        }
        if (i >= text.length) {
          setLines((prev) =>
            prev.map((l) => (l.id === id ? { ...l, typing: false } : l)),
          );
          resolve();
          return;
        }
        i += 1;
        const next = text.slice(0, i);
        setLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, shown: next } : l)),
        );
        const t = setTimeout(step, charDelay + Math.random() * 22);
        timersRef.current.push(t);
      };
      const t = setTimeout(step, 60);
      timersRef.current.push(t);
    });
  }

  async function play() {
    const myRun = ++runIdRef.current;
    clearTimers();
    setLines([]);
    setActive(null);
    await wait(40, myRun);

    for (const item of SCRIPT) {
      if (myRun !== runIdRef.current) return;

      // rolling window of 3: mark oldest as outgoing
      let outgoingId: number | null = null;
      setLines((prev) => {
        if (prev.length >= 3) {
          outgoingId = prev[0].id;
          return prev.map((l, idx) =>
            idx === 0 ? { ...l, state: "out" as const } : l,
          );
        }
        return prev;
      });

      // append new line in parallel with outgoing transition
      const id = ++idCounterRef.current;
      const newLine: RenderedLine = {
        ...item,
        id,
        shown: "",
        typing: true,
        state: "in",
      };
      setLines((prev) => [...prev, newLine]);
      setActive(item.who);

      // remove outgoing after its transition finishes
      if (outgoingId !== null) {
        const oid = outgoingId;
        const t = setTimeout(() => {
          setLines((prev) => prev.filter((l) => l.id !== oid));
        }, 600);
        timersRef.current.push(t);
      }

      await wait(280, myRun);
      await typewriter(id, item.text, item.who === "des" ? 28 : 32, myRun);
      await wait(item.who === "des" ? 900 : 700, myRun);
    }

    if (myRun === runIdRef.current) setActive(null);
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function tryPlay() {
      if (playedRef.current || document.hidden) return;
      playedRef.current = true;
      void play();
    }

    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) tryPlay();
          });
        },
        { threshold: [0, 0.05, 0.2] },
      );
      io.observe(section);
      const onVis = () => {
        if (!document.hidden && !playedRef.current) {
          const r = section.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) tryPlay();
        }
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
      };
    }
    tryPlay();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} className={styles.sDialogue}>
      <div
        className={`${styles.speaker} ${styles.reveal} ${styles.in} ${
          activeSpeaker === "sarah" ? styles.active : ""
        }`}
      >
        <div className={styles.av} />
        <div className={styles.who}>sarah</div>
        <div className={styles.speakerRole}>speaks</div>
      </div>

      <div
        className={`${styles.bubble} ${styles.reveal} ${styles.in}`}
        aria-live="polite"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`${styles.bLine} ${
              line.state === "in" ? styles.bLineIn : styles.bLineOut
            }`}
          >
            <span
              className={`${styles.bLineWho} ${
                line.who === "des" ? styles.bLineWhoDes : ""
              }`}
            >
              {line.label}
            </span>
            <span className={styles.bLineText}>
              {line.shown}
              {line.typing && <span className={styles.car} />}
            </span>
          </div>
        ))}
        <button
          type="button"
          className={styles.replay}
          onClick={() => {
            playedRef.current = true;
            void play();
          }}
        >
          replay
        </button>
      </div>

      <div
        className={`${styles.speaker} ${styles.designer} ${styles.reveal} ${styles.in} ${
          activeSpeaker === "des" ? styles.active : ""
        }`}
      >
        <div className={styles.av} />
        <div className={styles.who}>the designer</div>
        <div className={styles.speakerRole}>listens</div>
      </div>
    </section>
  );
}

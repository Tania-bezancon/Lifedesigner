"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import type { OrbHandle } from "@/components/orb-canvas";
import { generatePlan, type GeneratedPlan } from "@/lib/generate-plan";

type Phase = "idle" | "thinking" | "replying" | "done";
type Timing = { tookMs: number };

const PLACEHOLDERS = [
  "i sleep badly. i scroll until 1am.",
  "i've lost touch with my friends.",
  "everything feels noisy this week.",
  "i can't get going in the morning.",
];

export function YourTurn({
  orbRef,
  onPlanGenerated,
}: {
  orbRef: React.RefObject<OrbHandle>;
  onPlanGenerated: (plan: GeneratedPlan) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [reply, setReply] = useState<string[]>([]);
  const [typing, setTyping] = useState<string>("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [submittedIntent, setSubmittedIntent] = useState("");
  const [timing, setTiming] = useState<Timing | null>(null);
  const generatedRef = useRef<GeneratedPlan | null>(null);

  // Rotate placeholder on idle every few seconds for life.
  useEffect(() => {
    if (phase !== "idle") return;
    const t = setInterval(() => {
      setPlaceholder((p) => {
        const idx = PLACEHOLDERS.indexOf(p);
        return PLACEHOLDERS[(idx + 1) % PLACEHOLDERS.length];
      });
    }, 4200);
    return () => clearInterval(t);
  }, [phase]);

  async function submit() {
    const text = input.trim();
    if (!text || phase !== "idle") return;
    setSubmittedIntent(text);
    setPhase("thinking");
    orbRef.current?.setListen(0.7);
    const t0 = performance.now();

    // "designing" pause — long enough to feel intentional, short enough not to bore.
    await new Promise((r) => setTimeout(r, 1700));

    const generated = generatePlan(text);
    generatedRef.current = generated;
    setTiming({ tookMs: Math.round(performance.now() - t0) });
    setPhase("replying");

    // typewriter each reply line, with deliberate pauses between
    for (let i = 0; i < generated.reply.length; i++) {
      const line = generated.reply[i];
      // type the line char by char into `typing`, then push to reply
      for (let c = 1; c <= line.length; c++) {
        setTyping(line.slice(0, c));
        await new Promise((r) => setTimeout(r, 22 + Math.random() * 18));
      }
      setReply((prev) => [...prev, line]);
      setTyping("");
      await new Promise((r) => setTimeout(r, i === generated.reply.length - 1 ? 600 : 900));
    }

    orbRef.current?.setListen(0.2);
    onPlanGenerated(generated);
    setPhase("done");
    // settle the orb back to baseline
    setTimeout(() => orbRef.current?.setListen(false), 1200);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  }

  function reset() {
    setInput("");
    setReply([]);
    setTyping("");
    setSubmittedIntent("");
    setTiming(null);
    generatedRef.current = null;
    setPhase("idle");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <section className={styles.sYourTurn} id="your-turn">
      <div className={styles.yourTurnInner}>
        <div className={styles.yourTurnEyebrow}>
          <span className={styles.techLabel}>presence.calibrate()</span>
          <span className={styles.silenceMetric}>
            the designer averages <span className={styles.tnum}>12</span> words per reply.
          </span>
        </div>

        <h2 className={`${styles.display} ${styles.yourTurnHeadline}`}>
          tell me<br />
          <span className={styles.it}>one thing.</span>
        </h2>

        {phase === "idle" && (
          <div className={styles.yourTurnInputWrap}>
            <input
              ref={inputRef}
              className={styles.yourTurnInput}
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              maxLength={140}
              aria-label="tell the designer one thing about your week"
            />
            <button
              type="button"
              className={`${styles.yourTurnSubmit} ${input.trim() ? styles.yourTurnSubmitActive : ""}`}
              onClick={submit}
              disabled={!input.trim()}
            >
              press enter
              <span className={styles.yourTurnArrow} aria-hidden="true">↵</span>
            </button>
          </div>
        )}

        {phase !== "idle" && (
          <div className={styles.yourTurnSession}>
            <div className={styles.yourTurnYou}>
              <span className={styles.yourTurnLabel}>you</span>
              <p className={styles.yourTurnYourText}>{submittedIntent}</p>
            </div>

            <div className={styles.yourTurnDesigner}>
              <span className={`${styles.yourTurnLabel} ${styles.yourTurnLabelDes}`}>
                the designer
              </span>
              <div className={styles.yourTurnReply}>
                {phase === "thinking" && (
                  <span className={styles.yourTurnThinking}>
                    <span className={styles.yourTurnDot} />
                    <span className={styles.yourTurnDot} />
                    <span className={styles.yourTurnDot} />
                  </span>
                )}
                {reply.map((line, i) => (
                  <p key={i} className={styles.yourTurnReplyLine}>
                    {line}
                  </p>
                ))}
                {phase === "replying" && typing && (
                  <p className={styles.yourTurnReplyLine}>
                    {typing}
                    <span className={styles.car} />
                  </p>
                )}
              </div>
            </div>

            {phase === "done" && (
              <div className={styles.yourTurnFoot}>
                <span className={styles.yourTurnSysline}>
                  archetype:{" "}
                  <span className={styles.tnum}>{generatedRef.current?.archetype}</span>
                  {" · "}
                  rendered in{" "}
                  <span className={styles.tnum}>
                    {timing ? `${(timing.tookMs / 1000).toFixed(2)}s` : "—"}
                  </span>
                </span>
                <span className={styles.yourTurnFootHint}>
                  ↓ your week, just below
                </span>
                <button type="button" className={styles.yourTurnReset} onClick={reset}>
                  start over
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

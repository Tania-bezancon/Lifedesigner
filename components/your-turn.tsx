"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";
import { generatePlan, type GeneratedPlan } from "@/lib/generate-plan";
import { useI18n, useT } from "@/lib/i18n";

type Phase = "idle" | "thinking" | "replying" | "done";
type Timing = { tookMs: number };

const PLACEHOLDER_KEYS = [
  "yourTurnPlaceholder1",
  "yourTurnPlaceholder2",
  "yourTurnPlaceholder3",
  "yourTurnPlaceholder4",
] as const;

export function YourTurn({
  orbRef,
  onPlanGenerated,
}: {
  orbRef: React.RefObject<OrbHandle>;
  onPlanGenerated: (plan: GeneratedPlan) => void;
}) {
  const t = useT();
  const { lang } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const miniOrbRef = useRef<OrbHandle>(null);
  const typingPulseRef = useRef(0);
  const typingDecayRafRef = useRef<number | null>(null);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [reply, setReply] = useState<string[]>([]);
  const [typing, setTyping] = useState<string>("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholder = t(PLACEHOLDER_KEYS[placeholderIdx]);
  const [submittedIntent, setSubmittedIntent] = useState("");
  const [timing, setTiming] = useState<Timing | null>(null);
  const generatedRef = useRef<GeneratedPlan | null>(null);

  // Decay loop for the mini-orb's typing pulse.
  useEffect(() => {
    function tick() {
      typingPulseRef.current = Math.max(0, typingPulseRef.current * 0.92);
      if (phase === "idle" && miniOrbRef.current) {
        miniOrbRef.current.setListen(typingPulseRef.current);
      }
      typingDecayRafRef.current = requestAnimationFrame(tick);
    }
    typingDecayRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (typingDecayRafRef.current) cancelAnimationFrame(typingDecayRafRef.current);
    };
  }, [phase]);

  function bumpTypingPulse() {
    // small pulse on every keystroke; clamped at 0.9 so consecutive presses don't pin to 1
    typingPulseRef.current = Math.min(0.9, typingPulseRef.current + 0.35);
  }

  // Rotate placeholder on idle every few seconds for life.
  useEffect(() => {
    if (phase !== "idle") return;
    const i = setInterval(() => {
      setPlaceholderIdx((p) => (p + 1) % PLACEHOLDER_KEYS.length);
    }, 4200);
    return () => clearInterval(i);
  }, [phase]);

  async function submit() {
    const text = input.trim();
    if (!text || phase !== "idle") return;
    setSubmittedIntent(text);
    setPhase("thinking");
    orbRef.current?.setListen(0.7);
    miniOrbRef.current?.setListen(0.85);
    const t0 = performance.now();

    // "designing" pause — long enough to feel intentional, short enough not to bore.
    await new Promise((r) => setTimeout(r, 1700));

    const generated = generatePlan(text, lang);
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
    miniOrbRef.current?.setListen(0.4);
    onPlanGenerated(generated);
    setPhase("done");
    // settle the orbs back to baseline
    setTimeout(() => {
      orbRef.current?.setListen(false);
      miniOrbRef.current?.setListen(false);
    }, 1200);
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
          <span className={styles.techLabel}>{t("yourTurnTechLabel")}</span>
          <span className={styles.silenceMetric}>
            {t("yourTurnSilenceMetric")}
          </span>
        </div>

        <h2 className={`${styles.display} ${styles.yourTurnHeadline}`}>
          {t("yourTurnHeadline1")}
          <br />
          <span className={styles.it}>{t("yourTurnHeadline2")}</span>
        </h2>

        {phase === "idle" && (
          <div className={styles.yourTurnInputWrap}>
            <div className={styles.yourTurnMiniOrb} aria-hidden="true">
              <OrbCanvas ref={miniOrbRef} radius={0.34} />
            </div>
            <input
              ref={inputRef}
              className={styles.yourTurnInput}
              placeholder={placeholder}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                bumpTypingPulse();
              }}
              onKeyDown={onKey}
              maxLength={140}
              aria-label={t("yourTurnInputAria")}
            />
            <button
              type="button"
              className={`${styles.yourTurnSubmit} ${input.trim() ? styles.yourTurnSubmitActive : ""}`}
              onClick={submit}
              disabled={!input.trim()}
            >
              {t("yourTurnPressEnter")}
              <span className={styles.yourTurnArrow} aria-hidden="true">↵</span>
            </button>
          </div>
        )}

        {phase !== "idle" && (
          <div className={styles.yourTurnSession}>
            <div className={styles.yourTurnYou}>
              <span className={styles.yourTurnLabel}>{t("yourTurnLabelYou")}</span>
              <p className={styles.yourTurnYourText}>{submittedIntent}</p>
            </div>

            <div className={styles.yourTurnDesigner}>
              <span className={`${styles.yourTurnLabel} ${styles.yourTurnLabelDes}`}>
                {t("yourTurnLabelDesigner")}
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
                  {t("yourTurnSysArchetype")}:{" "}
                  <span className={styles.tnum}>{generatedRef.current?.archetype}</span>
                  {" · "}
                  {t("yourTurnSysRendered")}{" "}
                  <span className={styles.tnum}>
                    {timing ? `${(timing.tookMs / 1000).toFixed(2)}s` : "—"}
                  </span>
                </span>
                <span className={styles.yourTurnFootHint}>
                  {t("yourTurnFootHint")}
                </span>
                <button type="button" className={styles.yourTurnReset} onClick={reset}>
                  {t("yourTurnReset")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

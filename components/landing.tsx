"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/landing.module.css";
import { OrbCanvas, type OrbHandle } from "@/components/orb-canvas";
import { MariaIntro } from "@/components/maria-intro";
import { Connected } from "@/components/connected";
import { Program } from "@/components/program";
import { StickyOrb } from "@/components/sticky-orb";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { useT } from "@/lib/i18n";
import { startMic, type MicSession } from "@/components/mic";
import {
  playDesigner,
  speakDesigner,
  type DesignerSession,
} from "@/components/designer";
import { YourTurn } from "@/components/your-turn";
import { PlanSection } from "@/components/plan-section";
import { type GeneratedPlan } from "@/lib/generate-plan";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function revealClass(visible: boolean, extra?: string) {
  return `${styles.reveal} ${visible ? styles.in : ""} ${extra ?? ""}`;
}

function RevealDiv({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </div>
  );
}

function RevealH2({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { ref, visible } = useReveal<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </h2>
  );
}

function RevealP({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { ref, visible } = useReveal<HTMLParagraphElement>();
  return (
    <p ref={ref} className={revealClass(visible, className)} {...rest}>
      {children}
    </p>
  );
}

/** Small live-feeling counter for "weeks redesigned this hour" — slowly increments to feel computed, not staged. */
function LiveCounter() {
  const [n, setN] = useState(247);
  useEffect(() => {
    const t = setInterval(() => {
      setN((prev) => prev + (Math.random() < 0.4 ? 1 : 0));
    }, 4200);
    return () => clearInterval(t);
  }, []);
  return <span className={styles.tnum}>{n}</span>;
}

type ListenState = "idle" | "requesting" | "live" | "denied";
type DesignerState = "idle" | "speaking";

export function Landing() {
  const t = useT();
  const orbRef = useRef<OrbHandle>(null);
  const micRef = useRef<MicSession | null>(null);
  const designerRef = useRef<DesignerSession | null>(null);
  const heroOrbWrapperRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [listenState, setListenState] = useState<ListenState>("idle");
  const [designerState, setDesignerState] = useState<DesignerState>("idle");
  const [userPlan, setUserPlan] = useState<GeneratedPlan | null>(null);

  // Scroll progress bar at the top of the page.
  useEffect(() => {
    function update() {
      const el = progressRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Subtle mouse parallax on the hero orb — drift up to ~10px from center.
  // Disabled when the user prefers reduced motion.
  useEffect(() => {
    const wrap = heroOrbWrapperRef.current;
    if (!wrap) return;
    if (
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let raf = 0;
    let targetX = 0,
      targetY = 0;
    let curX = 0,
      curY = 0;

    function onMove(e: MouseEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // normalized -1..1 from center
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      targetX = nx * 10;
      targetY = ny * 10;
    }

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      if (wrap) {
        wrap.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    return () => {
      micRef.current?.stop();
      designerRef.current?.stop();
      micRef.current = null;
      designerRef.current = null;
    };
  }, []);

  async function toggleListen() {
    if (designerState === "speaking") return; // designer's turn — block mic
    if (listenState === "live") {
      micRef.current?.stop();
      micRef.current = null;
      setListenState("idle");
      orbRef.current?.setListen(false);
      return;
    }
    if (listenState === "denied") {
      orbRef.current?.setListen(true);
      setListenState("live");
      return;
    }
    setListenState("requesting");
    try {
      const session = await startMic((level) => {
        orbRef.current?.setListen(level);
      });
      micRef.current = session;
      setListenState("live");
    } catch {
      setListenState("denied");
      orbRef.current?.setListen(true);
    }
  }

  async function toggleHear() {
    if (designerState === "speaking") {
      designerRef.current?.stop();
      designerRef.current = null;
      setDesignerState("idle");
      orbRef.current?.setListen(false);
      return;
    }
    // Stop mic if active to avoid signal collision.
    if (listenState === "live" && micRef.current) {
      micRef.current.stop();
      micRef.current = null;
      setListenState("idle");
    }
    setDesignerState("speaking");
    const onLevel = (level: number) => orbRef.current?.setListen(level);
    const onComplete = () => {
      designerRef.current = null;
      setDesignerState("idle");
      orbRef.current?.setListen(false);
    };
    try {
      // Prefer real synthesized voice; fall back to procedural pad if SpeechSynthesis is unavailable.
      const speech = await speakDesigner(onLevel, onComplete);
      if (speech) {
        designerRef.current = speech;
      } else {
        designerRef.current = await playDesigner(onLevel, onComplete);
      }
    } catch {
      setDesignerState("idle");
    }
  }

  const listening = listenState === "live" || listenState === "requesting";
  const speaking = designerState === "speaking";

  return (
    <div className={styles.root}>
      <div className={styles.grain} />
      <div ref={progressRef} className={styles.scrollProgress} aria-hidden="true" />
      <StickyOrb />

      <nav className={styles.nav}>
        <a className={styles.mark} href="#">
          <span className={styles.glyph} />
          lifedesigner
        </a>
        <div className={styles.navLinks}>
          <a href="#maria">{t("navMaria")}</a>
          <a href="#program">{t("navProgram")}</a>
          <a href="#your-turn">{t("navYourTurn")}</a>
        </div>
        <div className={styles.navRight}>
          <LangToggle />
          <ThemeToggle />
          <a className={styles.ctaMini} href="#cta">
            {t("navBegin")}
          </a>
        </div>
      </nav>

      <main className={styles.main}>
        {/* ============== 01 HERO ============== */}
        <section className={styles.hero} id="hero">
          <RevealDiv className={styles.heroCopy}>
            <h1 className={styles.display}>
              {t("heroTitle1")}
              <br />
              <span className={styles.it}>{t("heroTitle2")}</span>
            </h1>
            <p className={styles.heroSub}>{t("heroSub")}</p>
            <div className={styles.heroMeta}>
              <span className={styles.pip} aria-hidden="true" />
              <span>
                {t("heroMetaPrefix")} · <LiveCounter /> {t("heroMetaSuffix")}
              </span>
            </div>
          </RevealDiv>

          <div ref={heroOrbWrapperRef} className={styles.heroOrb} aria-hidden="true">
            <OrbCanvas ref={orbRef} radius={0.3} />
            <div className={styles.orbControls}>
              <button
                type="button"
                className={`${styles.listenMini} ${speaking ? styles.listenOn : ""}`}
                aria-pressed={speaking}
                onClick={toggleHear}
              >
                <span className={styles.listenDot} />
                <span>{speaking ? t("heroHearActive") : t("heroHear")}</span>
              </button>
              <button
                type="button"
                className={`${styles.listenMini} ${listening ? styles.listenOn : ""}`}
                aria-pressed={listening}
                onClick={toggleListen}
                disabled={listenState === "requesting" || speaking}
              >
                <span className={styles.listenDot} />
                <span>
                  {listenState === "requesting"
                    ? t("heroListenAsking")
                    : listenState === "live"
                      ? t("heroListenActive")
                      : listenState === "denied"
                        ? t("heroListenDenied")
                        : t("heroListen")}
                </span>
              </button>
            </div>
          </div>

          <a className={styles.scrollHint} href="#maria">
            {t("heroScrollHint")}
          </a>
        </section>

        {/* ============== 02 MARIA — meet her ============== */}
        <MariaIntro />

        {/* ============== 03 CONNECTED — the designer reads her life ============== */}
        <Connected />

        {/* ============== 04 PROGRAM — 12 weeks of micro-habits ============== */}
        <Program />

        {/* ============== 05 YOUR TURN — interactive ============== */}
        <YourTurn orbRef={orbRef} onPlanGenerated={setUserPlan} />

        {/* ============== 06 PLAN — generated for the visitor ============== */}
        <PlanSection plan={userPlan} />

        {/* ============== 07 CTA ============== */}
        <section className={styles.sCta} id="cta">
          <RevealH2 className={`${styles.display} ${styles.ctaHeadline}`}>
            {t("ctaHeadline1")}
            <br />
            <span className={styles.it}>{t("ctaHeadline2")}</span>
          </RevealH2>
          <RevealP className={styles.ctaSub}>{t("ctaSub")}</RevealP>
          <RevealDiv className={styles.ctaRow}>
            <a href="#" className={`${styles.btn} ${styles.btnPrimary}`}>
              {t("ctaPrimary")}
            </a>
            <a href="#hero" className={`${styles.btn} ${styles.btnGhost}`}>
              {t("ctaSecondary")}
            </a>
          </RevealDiv>
          <RevealDiv className={styles.ctaFoot}>{t("ctaFoot")}</RevealDiv>
        </section>

      </main>

      <FooterBlock />
    </div>
  );
}

function FooterSession() {
  const t = useT();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const i = setInterval(() => {
      setSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(i);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <span className={styles.tnum}>
      {t("footerSysSession")} {m}m {String(s).padStart(2, "0")}s
    </span>
  );
}

function FooterOrb() {
  const ref = useRef<OrbHandle>(null);
  useEffect(() => {
    // ambient breath — gentle, never silent
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = (now - start) * 0.001;
      const v = 0.32 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.6));
      ref.current?.setListen(v);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={styles.footerOrb} aria-hidden="true">
      <OrbCanvas ref={ref} radius={0.36} />
    </div>
  );
}

function FooterBlock() {
  const t = useT();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <FooterOrb />

        <div className={styles.footerCenter}>
          <span className={styles.footerBadge}>{t("footerBadge")}</span>
          <p className={styles.footerNote}>{t("footerNote1")}</p>
          <p className={styles.footerNote}>{t("footerNote2")}</p>
          <p className={styles.footerSign}>{t("footerSign")}</p>
          <ul className={styles.footerLinks}>
            <li>
              <a
                href="https://www.linkedin.com/in/tania-bezancon/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footerLinkLinkedin")}
              </a>
            </li>
            <li>
              <a
                href="https://taniabezancon.netlify.app/en"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footerLinkPortfolio")}
              </a>
            </li>
            <li>
              <a
                href="https://github.com/tania-bezancon"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("footerLinkGithub")}
              </a>
            </li>
          </ul>
        </div>

        <nav className={styles.footerNav} aria-label="footer navigation">
          <a href="#hero">{t("footerNavBeginAgain")}</a>
          <a href="#maria">{t("footerNavMaria")}</a>
          <a href="#program">{t("footerNavProgram")}</a>
          <a href="#your-turn">{t("footerNavYourTurn")}</a>
          <a href="#cta">{t("footerNavCta")}</a>
        </nav>
      </div>

      <div className={styles.footerSystem}>
        <span>{t("footerSysIdle")}</span>
        <FooterSession />
        <span>{t("footerSysCopyright")}</span>
      </div>
    </footer>
  );
}

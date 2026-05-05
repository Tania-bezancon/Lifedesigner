import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-tight",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lifedesigner.app"),
  title: "lifedesigner — your life, redesigned with you.",
  description:
    "a concept interface for a voice-first life designer. it listens, asks you to imagine your dream life, and renders it as twelve weeks of micro-habits.",
  keywords: [
    "life design",
    "voice-first",
    "habits",
    "ai companion",
    "concept",
    "design",
    "tania bezancon",
  ],
  authors: [
    { name: "tania bezancon", url: "https://taniabezancon.netlify.app/en" },
  ],
  creator: "tania bezancon",
  openGraph: {
    type: "website",
    title: "lifedesigner — your life, redesigned with you.",
    description:
      "a concept interface for a voice-first life designer. listens, remembers, and renders the week you actually want.",
    siteName: "lifedesigner",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "lifedesigner — your life, redesigned with you.",
    description:
      "a concept interface for a voice-first life designer. listens, remembers, and renders the week you actually want.",
    creator: "@taniabezancon",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e10" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Pre-paint theme + lang script: avoids flashes before stored preferences
// are read. Runs synchronously in the head before first render.
const initScript = `
(function() {
  try {
    var stored = localStorage.getItem('ld-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  try {
    var storedLang = localStorage.getItem('ld-lang');
    var browserLang = (navigator.language || 'en').toLowerCase();
    var lang = storedLang || (browserLang.indexOf('fr') === 0 ? 'fr' : 'en');
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
  } catch (e) {
    document.documentElement.setAttribute('data-lang', 'en');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={interTight.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme + lang init must run before paint
          dangerouslySetInnerHTML={{ __html: initScript }}
        />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

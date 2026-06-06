const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

function ensureDataLayer() {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

export function initGoogleAnalytics() {
  if (!MEASUREMENT_ID || initialized || typeof document === "undefined") {
    return;
  }

  const dataLayer = ensureDataLayer();
  if (!dataLayer) return;

  const scriptId = "google-analytics-gtag";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
  initialized = true;
}

export function trackPageView(path: string) {
  if (!MEASUREMENT_ID || typeof window === "undefined") return;

  ensureDataLayer();
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("config", MEASUREMENT_ID, {
    page_path: path,
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export {};

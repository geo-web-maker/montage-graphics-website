import React, { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise;
function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { scriptPromise = undefined; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export const turnstileEnabled = Boolean(SITE_KEY);

// Cloudflare Turnstile widget. Calls onToken(token) when solved and onToken(null)
// on expiry/error. Bump `resetKey` after every submit: tokens are single-use.
export default function Turnstile({ onToken, resetKey = 0, theme = "auto" }) {
  const box = useRef(null);
  const widgetId = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;
    loadScript()
      .then((ts) => {
        if (cancelled || !box.current) return;
        widgetId.current = ts.render(box.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (t) => cb.current?.(t),
          "expired-callback": () => cb.current?.(null),
          "error-callback": () => cb.current?.(null),
        });
      })
      .catch(() => cb.current?.(null));
    return () => {
      cancelled = true;
      if (widgetId.current != null && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (resetKey && widgetId.current != null && window.turnstile) {
      cb.current?.(null);
      window.turnstile.reset(widgetId.current);
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return <div ref={box} className="turnstile-box" />;
}

import { useEffect } from "react";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  // Registracija Service Worker-a (offline rad + instalacija na ekran).
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("SW registracija neuspešna:", err));
    }
  }, []);

  return <Component {...pageProps} />;
}

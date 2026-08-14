"use client";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import it from "./locales/it.json";

export const SUPPORTED_LANGUAGES = ["en", "it"];
export const LANGUAGE_STORAGE_KEY = "language";

// No language detector here on purpose: detection reads localStorage/navigator,
// which don't exist on the server and would make the client's first render
// (before hydration) disagree with the server-rendered HTML. Instead we always
// initialize to a fixed language ("en") so server and first client paint match,
// then Providers switches to the saved/detected language in a useEffect —
// after hydration, so it's a normal update rather than a mismatch.
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        it: { translation: it },
      },
      lng: "en",
      fallbackLng: "en",
      supportedLngs: SUPPORTED_LANGUAGES,
      interpolation: { escapeValue: false },
    });
}

export default i18next;

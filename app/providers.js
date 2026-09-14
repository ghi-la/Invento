"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { I18nextProvider } from "react-i18next";
import theme from "./theme";
import { SWRConfig } from "swr";
import i18n, { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

const fetcher = (url) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Request failed");
    }
    return res.json();
  });

function SyncLanguage() {
  useEffect(() => {
    // Runs once after hydration — safe to touch localStorage/navigator here,
    // since any change now is a normal client update, not a hydration mismatch.
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browser = navigator.language?.split("-")[0];
    const detected = [stored, browser].find((l) => SUPPORTED_LANGUAGES.includes(l));
    if (detected && detected !== i18n.language) {
      i18n.changeLanguage(detected);
    }

    document.documentElement.lang = i18n.language?.split("-")[0] || "en";
    const handler = (lng) => {
      document.documentElement.lang = lng?.split("-")[0] || "en";
    };
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, []);
  return null;
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <SyncLanguage />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SWRConfig value={{ fetcher, revalidateOnFocus: true, keepPreviousData: true }}>{children}</SWRConfig>
        </ThemeProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}

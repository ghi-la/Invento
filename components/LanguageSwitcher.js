"use client";
import { useTranslation } from "react-i18next";
import { Select, MenuItem } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

export default function LanguageSwitcher({ size = "small", sx }) {
  const { t, i18n } = useTranslation();
  const current = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage) ? i18n.resolvedLanguage : "en";

  function handleChange(lng) {
    i18n.changeLanguage(lng);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }

  return (
    <Select
      value={current}
      size={size}
      onChange={(e) => handleChange(e.target.value)}
      renderValue={(value) => (
        <>
          <LanguageIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.75, mb: "2px" }} />
          {t(`language.${value}`)}
        </>
      )}
      sx={sx}
      inputProps={{ "aria-label": t("language.label") }}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <MenuItem key={lng} value={lng}>
          {t(`language.${lng}`)}
        </MenuItem>
      ))}
    </Select>
  );
}

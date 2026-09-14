export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "INR",
  "BRL",
  "MXN",
  "ZAR",
  "SGD",
  "HKD",
  "AED",
];

// Intl already knows the display name and symbol for every ISO 4217 code in
// both of our locales, so there's no per-currency i18n string to maintain.
export function currencyName(code, locale) {
  try {
    return new Intl.DisplayNames([locale || "en"], { type: "currency" }).of(code) || code;
  } catch {
    return code;
  }
}

export function currencySymbol(code, locale) {
  try {
    const parts = new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value || code;
  } catch {
    return code;
  }
}

export function formatCurrency(amount, code = "USD", options = {}) {
  // No maximumFractionDigits default here: Intl already applies the right
  // number of decimals per ISO 4217 currency (0 for JPY, 2 for USD/EUR/CHF,
  // 3 for BHD, ...). Callers only pass overrides when they deliberately want
  // something else (e.g. a rounded whole-number headline stat).
  const { locale, ...numberFormatOptions } = options;
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency: code,
      ...numberFormatOptions,
    }).format(amount || 0);
  } catch {
    return `${amount ?? 0} ${code}`;
  }
}

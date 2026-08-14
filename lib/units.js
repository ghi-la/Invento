export const UNIT_VALUES = ["pcs", "box", "pack", "case", "pallet", "kg", "g", "l", "ml", "m"];

// `t` is the i18next translate function (from useTranslation()). Falls back to
// the raw unit code for legacy/imported values that aren't one of the presets.
export function unitLabel(t, value) {
  return UNIT_VALUES.includes(value) ? t(`units.${value}`) : value;
}

export function unitShortLabel(t, value) {
  return UNIT_VALUES.includes(value) ? t(`units.short.${value}`) : value;
}

// For "box" (or any unit with itemsPerUnit set), formats both the unit count
// and the equivalent number of individual items, e.g. "12 box (600 pcs)".
export function formatQuantity(t, quantity, unit, itemsPerUnit) {
  if (unit === "box" && itemsPerUnit > 0) {
    const totalItems = quantity * itemsPerUnit;
    return `${quantity} ${unitShortLabel(t, "box")} (${totalItems} ${unitShortLabel(t, "pcs")})`;
  }
  return unit ? `${quantity} ${unitShortLabel(t, unit)}` : `${quantity}`;
}

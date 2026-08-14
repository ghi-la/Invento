"use client";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Typography, TextField, ClickAwayListener } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { unitShortLabel } from "@/lib/units";

/**
 * Big-target +/- stepper for quantity. Taps update the UI instantly and are
 * coalesced into a single API call after a short pause, so rapid tapping
 * feels immediate but doesn't spam the network. Tap the number itself to
 * type an exact value.
 */
export default function QuantityStepper({
  warehouseId,
  productId,
  quantity,
  unit,
  itemsPerBox = 0,
  size = "medium", // "medium" | "large"
  onChanged, // (newQuantity) => void
  disabled = false,
}) {
  const { t } = useTranslation();
  const [display, setDisplay] = useState(quantity);
  const [flash, setFlash] = useState(null); // "up" | "down" | null
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const pendingDelta = useRef(0);
  const timer = useRef(null);
  const holdTimeout = useRef(null);
  const holdInterval = useRef(null);
  const holding = useRef(false);

  useEffect(() => setDisplay(quantity), [quantity]);

  useEffect(() => {
    return () => {
      clearTimeout(holdTimeout.current);
      clearInterval(holdInterval.current);
    };
  }, []);

  function scheduleSend() {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const delta = pendingDelta.current;
      pendingDelta.current = 0;
      if (delta === 0) return;
      try {
        const res = await fetch(`/api/warehouses/${warehouseId}/products/${productId}/adjust`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDisplay(data.quantity);
        onChanged?.(data.quantity);
      } catch {
        setDisplay((d) => d - delta); // revert optimistic change on failure
      }
    }, 450);
  }

  function bump(delta) {
    if (disabled) return;
    setDisplay((d) => Math.max(0, d + delta));
    pendingDelta.current += delta;
    setFlash(delta > 0 ? "up" : "down");
    setTimeout(() => setFlash(null), 200);
    scheduleSend();
  }

  // Tap bumps by 1 (via onClick). Holding the button past HOLD_DELAY switches
  // to repeated jumps of REPEAT_STEP every REPEAT_INTERVAL until released.
  const HOLD_DELAY = 450;
  const REPEAT_INTERVAL = 500;
  const REPEAT_STEP = 10;

  function startHold(delta) {
    if (disabled) return;
    clearTimeout(holdTimeout.current);
    clearInterval(holdInterval.current);
    holdTimeout.current = setTimeout(() => {
      holding.current = true;
      bump(delta * REPEAT_STEP);
      holdInterval.current = setInterval(() => bump(delta * REPEAT_STEP), REPEAT_INTERVAL);
    }, HOLD_DELAY);
  }

  function endHold() {
    clearTimeout(holdTimeout.current);
    clearInterval(holdInterval.current);
  }

  function handleTap(delta) {
    if (holding.current) {
      holding.current = false; // swallow the click that follows a long press
      return;
    }
    bump(delta);
  }

  async function commitExact() {
    setEditing(false);
    const val = Math.max(0, parseInt(editValue, 10));
    if (Number.isNaN(val) || val === display) return;
    setDisplay(val);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/products/${productId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChanged?.(data.quantity);
    } catch {
      setDisplay(quantity);
    }
  }

  const btnSize = size === "large" ? 52 : 40;
  const fontSize = size === "large" ? 28 : 18;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: size === "large" ? 1.5 : 0.75 }}>
      <IconButton
        onClick={() => handleTap(-1)}
        onPointerDown={() => startHold(-1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        disabled={disabled || display <= 0}
        sx={{
          width: btnSize,
          height: btnSize,
          bgcolor: "grey.100",
          "&:hover": { bgcolor: "grey.200" },
          touchAction: "none",
        }}
      >
        <RemoveIcon fontSize={size === "large" ? "medium" : "small"} />
      </IconButton>

      {editing ? (
        <ClickAwayListener onClickAway={commitExact}>
          <TextField
            autoFocus
            size="small"
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitExact()}
            sx={{ width: 76 }}
            inputProps={{ style: { textAlign: "center", fontFamily: "var(--mono-font)" } }}
          />
        </ClickAwayListener>
      ) : (
        <Box
          onClick={() => {
            if (disabled) return;
            setEditValue(String(display));
            setEditing(true);
          }}
          sx={{ cursor: disabled ? "default" : "pointer", userSelect: "none", textAlign: "center" }}
        >
          <Typography
            sx={{
              minWidth: size === "large" ? 64 : 40,
              fontFamily: '"SF Mono","Roboto Mono",monospace',
              fontWeight: 700,
              fontSize,
              color: flash === "up" ? "success.main" : flash === "down" ? "error.main" : "text.primary",
              transition: "color 0.15s",
            }}
          >
            {display}
            {unit ? (
              <Typography component="span" sx={{ fontSize: fontSize * 0.4, color: "text.secondary", ml: 0.5 }}>
                {unitShortLabel(t, unit)}
              </Typography>
            ) : null}
          </Typography>
          {unit === "box" && itemsPerBox > 0 ? (
            <Typography sx={{ fontSize: fontSize * 0.32, color: "text.secondary", lineHeight: 1 }}>
              {display * itemsPerBox} {unitShortLabel(t, "pcs")}
            </Typography>
          ) : null}
        </Box>
      )}

      <IconButton
        onClick={() => handleTap(1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        disabled={disabled}
        sx={{
          width: btnSize,
          height: btnSize,
          bgcolor: "warning.main",
          color: "primary.main",
          "&:hover": { bgcolor: "warning.dark" },
          touchAction: "none",
        }}
      >
        <AddIcon fontSize={size === "large" ? "medium" : "small"} />
      </IconButton>
    </Box>
  );
}

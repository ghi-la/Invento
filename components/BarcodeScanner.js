"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Alert, TextField, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardIcon from "@mui/icons-material/Keyboard";

const ELEMENT_ID = "barcode-reader-viewport";

export default function BarcodeScanner({ onScan, onClose }) {
  const { t } = useTranslation();
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(ELEMENT_ID, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 260, height: 160 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {
            /* per-frame decode errors are expected while aiming — ignore */
          }
        );
        startedRef.current = true;
      } catch (err) {
        if (!cancelled) {
          setError(t("scan.cameraError"));
          setManualMode(true);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (scannerRef.current && startedRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ position: "relative", bgcolor: "black", borderRadius: 2, overflow: "hidden" }}>
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 2, bgcolor: "rgba(0,0,0,0.5)", color: "white" }}
      >
        <CloseIcon />
      </IconButton>

      {!manualMode && (
        <Box id={ELEMENT_ID} sx={{ width: "100%", minHeight: 280, "& video": { width: "100%" } }} />
      )}

      {manualMode ? (
        <Box sx={{ p: 3, bgcolor: "background.paper" }}>
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              autoFocus
              fullWidth
              label={t("scan.barcodeSkuLabel")}
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && manualValue.trim() && onScan(manualValue.trim())}
            />
            <Button
              variant="contained"
              disabled={!manualValue.trim()}
              onClick={() => onScan(manualValue.trim())}
            >
              {t("common.go")}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
          <Button
            size="small"
            startIcon={<KeyboardIcon />}
            onClick={() => setManualMode(true)}
            sx={{ color: "white", bgcolor: "rgba(0,0,0,0.4)", "&:hover": { bgcolor: "rgba(0,0,0,0.6)" } }}
          >
            {t("scan.typeInstead")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

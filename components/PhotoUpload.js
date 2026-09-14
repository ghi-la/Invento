"use client";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Avatar, IconButton, CircularProgress, Typography, Alert } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { resizeImageFile } from "@/lib/imageResize";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PhotoUpload({ warehouseId, value, onChange }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function attemptUpload(form) {
    const res = await fetch(`/api/warehouses/${warehouseId}/uploads`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t("product.photo.errors.uploadFailed"));
    return data;
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const resized = await resizeImageFile(file);
      const form = new FormData();
      form.append("file", resized, "photo.jpg");
      // A cold serverless function (fresh DB connection + blob upload) can
      // occasionally time out on the very first hit — one silent retry covers
      // that without making the user notice and reload the page themselves.
      let data;
      try {
        data = await attemptUpload(form);
      } catch {
        await sleep(1000);
        data = await attemptUpload(form);
      }
      onChange(data.url);
    } catch (err) {
      setError(err.message || t("product.photo.errors.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            variant="rounded"
            src={value || undefined}
            sx={{ width: 72, height: 72, bgcolor: "grey.200" }}
          >
            <Inventory2Icon />
          </Avatar>
          {uploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.35)",
                borderRadius: 1,
              }}
            >
              <CircularProgress size={22} sx={{ color: "common.white" }} />
            </Box>
          )}
          {value && !uploading && (
            <IconButton
              size="small"
              onClick={() => onChange("")}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "background.paper",
                boxShadow: 1,
                width: 22,
                height: 22,
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        <IconButton
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          sx={{
            width: 44,
            height: 44,
            bgcolor: "grey.100",
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          <AddAPhotoIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {value ? t("product.photo.change") : t("product.photo.upload")}
        </Typography>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

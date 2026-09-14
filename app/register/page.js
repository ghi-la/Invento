"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import Link from "next/link";
import { isValidEmail } from "@/lib/validation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = t("auth.errors.nameRequired");
    if (!email.trim()) errors.email = t("auth.errors.emailRequired");
    else if (!isValidEmail(email.trim())) errors.email = t("auth.errors.emailInvalid");
    if (!password) errors.password = t("auth.errors.passwordRequired");
    else if (password.length < 8) errors.password = t("auth.errors.passwordMinLength");
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("auth.errors.createFailed"));

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) throw new Error(t("auth.errors.createdPleaseSignIn"));
      router.push(params.get("callbackUrl") || "/warehouses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "fixed", top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>
      <Container maxWidth="xs">
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2Icon sx={{ color: "warning.main" }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            {t("auth.createAccountTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("auth.createAccountSubtitle")}
          </Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
            <TextField
              label={t("auth.fullName")}
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: "" }));
              }}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              required
              fullWidth
            />
            <TextField
              label={t("common.fields.email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: "" }));
              }}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              required
              fullWidth
            />
            <TextField
              label={t("common.fields.password")}
              type="password"
              autoComplete="new-password"
              helperText={fieldErrors.password || t("auth.passwordHelper")}
              error={!!fieldErrors.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: "" }));
              }}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? t("auth.creatingAccount") : t("auth.createAccountButton")}
            </Button>
          </Stack>
        </Card>

        <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            href={params.get("callbackUrl") ? `/login?callbackUrl=${encodeURIComponent(params.get("callbackUrl"))}` : "/login"}
            style={{ color: "inherit", fontWeight: 600 }}
          >
            {t("auth.signInLink")}
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

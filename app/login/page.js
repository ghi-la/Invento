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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = t("auth.errors.emailRequired");
    else if (!isValidEmail(email.trim())) errors.email = t("auth.errors.emailInvalid");
    if (!password) errors.password = t("auth.errors.passwordRequired");
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
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t("auth.errors.invalidCredentials"));
    } else {
      router.push(params.get("callbackUrl") || "/warehouses");
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
            {t("auth.signInTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("auth.signInSubtitle")}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: "" }));
              }}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
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
              {loading ? t("auth.signingIn") : t("auth.signInButton")}
            </Button>
          </Stack>
        </Card>

        <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
          {t("auth.noAccount")}{" "}
          <Link
            href={params.get("callbackUrl") ? `/register?callbackUrl=${encodeURIComponent(params.get("callbackUrl"))}` : "/register"}
            style={{ color: "inherit", fontWeight: 600 }}
          >
            {t("auth.createAccountLink")}
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

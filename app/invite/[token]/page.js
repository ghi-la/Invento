"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import MailIcon from "@mui/icons-material/MailOutline";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function InvitePage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/invites/${token}`);
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.status === 410 ? "expired" : "notFound");
      } else {
        setInvite(data);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleAccept() {
    setActionError("");
    setAccepting(true);
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("invite.errors.acceptFailed"));
      router.push(`/w/${data.warehouseId}`);
    } catch (err) {
      setActionError(err.message);
      setAccepting(false);
    }
  }

  function handleDecline() {
    router.push("/warehouses");
  }

  const authed = sessionStatus === "authenticated" && !!session?.user;

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
            <MailIcon sx={{ color: "warning.main" }} />
          </Box>
          <Typography variant="h5" fontWeight={700} align="center">
            {loading
              ? t("invite.loading")
              : loadError
              ? t(`invite.${loadError}Title`)
              : t("invite.invitedTitle")}
          </Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          {loading && (
            <Stack alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={28} />
            </Stack>
          )}

          {!loading && loadError && (
            <Stack spacing={2}>
              <Alert severity="error">{t(`invite.${loadError}Body`)}</Alert>
              <Button variant="contained" fullWidth onClick={() => router.push("/warehouses")}>
                {t("common.back")}
              </Button>
            </Stack>
          )}

          {!loading && !loadError && invite && (
            <Stack spacing={2.5}>
              <Typography variant="body1" align="center">
                {t("invite.invitedBody", {
                  warehouse: invite.warehouseName,
                  role: t(`roles.${invite.role}.label`),
                })}
              </Typography>

              {actionError && <Alert severity="error">{actionError}</Alert>}

              {sessionStatus === "loading" && (
                <Stack alignItems="center" sx={{ py: 1 }}>
                  <CircularProgress size={24} />
                </Stack>
              )}

              {sessionStatus !== "loading" && !authed && (
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                  >
                    {t("invite.loginButton")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    href={`/register?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                  >
                    {t("invite.signupButton")}
                  </Button>
                </Stack>
              )}

              {authed && (
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={accepting}
                    onClick={handleAccept}
                    startIcon={accepting ? <CircularProgress size={18} color="inherit" /> : null}
                  >
                    {accepting ? t("invite.accepting") : t("invite.acceptButton")}
                  </Button>
                  <Button variant="text" fullWidth disabled={accepting} onClick={handleDecline}>
                    {t("invite.declineButton")}
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Card>
      </Container>
    </Box>
  );
}

"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import RoleGuard from "@/components/RoleGuard";
import { useWarehouse } from "@/components/WarehouseContext";
import { ROLE_KEYS, assignableRoles } from "@/lib/permissions";

export default function MembersPage() {
  return (
    <RoleGuard minRole="admin">
      <MembersInner />
    </RoleGuard>
  );
}

function MembersInner() {
  const { t } = useTranslation();
  const { warehouseId } = useParams();
  const { role: myRole } = useWarehouse();
  const { data, mutate } = useSWR(`/api/warehouses/${warehouseId}/members`);
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);

  async function changeRole(userId, role) {
    setError("");
    setPendingUserId(userId);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || t("members.errors.changeRoleFailed"));
      }
      await mutate();
    } finally {
      setPendingUserId(null);
    }
  }

  async function removeMember(userId) {
    setPendingUserId(userId);
    try {
      await fetch(`/api/warehouses/${warehouseId}/members/${userId}`, { method: "DELETE" });
      await mutate();
    } finally {
      setPendingUserId(null);
    }
  }

  const assignable = assignableRoles(myRole);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("members.title")}
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setAddOpen(true)}>
          {t("members.addButton")}
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("members.subtitle")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <List disablePadding>
          {data?.members?.map((m) => (
            <ListItem
              key={m.membershipId}
              secondaryAction={
                m.role === "owner" ? (
                  <Chip label={t("roles.owner.label")} size="small" />
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    {pendingUserId === m.userId && <CircularProgress size={16} />}
                    <Select
                      size="small"
                      value={m.role}
                      disabled={pendingUserId === m.userId}
                      onChange={(e) => changeRole(m.userId, e.target.value)}
                    >
                      {assignable.map((r) => (
                        <MenuItem key={r} value={r}>
                          {t(`roles.${r}.label`)}
                        </MenuItem>
                      ))}
                      {!assignable.includes(m.role) && (
                        <MenuItem value={m.role} disabled>
                          {t(`roles.${m.role}.label`)}
                        </MenuItem>
                      )}
                    </Select>
                    <IconButton
                      edge="end"
                      color="error"
                      disabled={pendingUserId === m.userId}
                      onClick={() => removeMember(m.userId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )
              }
            >
              <ListItemAvatar>
                <Avatar src={m.image}>{m.name?.[0]?.toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${m.name}${m.isSelf ? t("members.you") : ""}`}
                secondary={m.email}
              />
            </ListItem>
          ))}
        </List>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t("members.roleExplainerTitle")}
        </Typography>
        <Stack spacing={0.75}>
          {ROLE_KEYS.map((role) => (
            <Typography key={role} variant="body2" color="text.secondary">
              <b>{t(`roles.${role}.label`)}:</b> {t(`roles.${role}.description`)}
            </Typography>
          ))}
        </Stack>
      </Box>

      <AddMemberDialog
        warehouseId={warehouseId}
        assignable={assignable}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          mutate();
          setAddOpen(false);
        }}
      />

      <InvitationsSection warehouseId={warehouseId} assignable={assignable} />
    </Box>
  );
}

function InvitationsSection({ warehouseId, assignable }) {
  const { t } = useTranslation();
  const { data, mutate } = useSWR(`/api/warehouses/${warehouseId}/invitations`);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  async function revoke(id) {
    setError("");
    setPendingId(id);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/invitations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || t("members.invitations.errors.revokeFailed"));
      }
      await mutate();
    } finally {
      setPendingId(null);
    }
  }

  async function copyLink(inv) {
    const url = `${window.location.origin}/invite/${inv.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(inv.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard access denied — nothing else we can do here
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("members.invitations.title")}
        </Typography>
        <Button variant="outlined" startIcon={<LinkIcon />} onClick={() => setCreateOpen(true)}>
          {t("members.invitations.newButton")}
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("members.invitations.subtitle")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <List disablePadding>
          {data?.invitations?.length ? (
            data.invitations.map((inv) => (
              <ListItem
                key={inv.id}
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {pendingId === inv.id && <CircularProgress size={16} />}
                    <IconButton edge="end" onClick={() => copyLink(inv)} title={t("members.invitations.copy")}>
                      {copiedId === inv.id ? (
                        <CheckIcon fontSize="small" color="success" />
                      ) : (
                        <ContentCopyIcon fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      disabled={pendingId === inv.id}
                      onClick={() => revoke(inv.id)}
                      title={t("members.invitations.revoke")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={t(`roles.${inv.role}.label`)}
                  secondary={t("members.invitations.expiresOn", {
                    date: new Date(inv.expiresAt).toLocaleDateString(),
                  })}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText secondary={t("members.invitations.empty")} />
            </ListItem>
          )}
        </List>
      </Card>

      <CreateInvitationDialog
        warehouseId={warehouseId}
        assignable={assignable}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          mutate();
          setCreateOpen(false);
        }}
      />
    </Box>
  );
}

function CreateInvitationDialog({ warehouseId, assignable, open, onClose, onCreated }) {
  const { t } = useTranslation();
  const [role, setRole] = useState(assignable[assignable.length - 1] || "viewer");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("members.invitations.errors.createFailed"));
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("members.invitations.createDialogTitle")}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("members.invitations.createDialogBody")}
        </Typography>
        <Select fullWidth value={role} onChange={(e) => setRole(e.target.value)}>
          {assignable.map((r) => (
            <MenuItem key={r} value={r}>
              {t(`roles.${r}.label`)}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={saving} onClick={handleCreate}>
          {saving ? t("members.invitations.creating") : t("members.invitations.newButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddMemberDialog({ warehouseId, assignable, open, onClose, onAdded }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState(assignable[assignable.length - 1] || "viewer");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setOptions([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(inputValue)}`);
      const data = await res.json();
      setOptions(data.users || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  async function handleAdd() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser?.email || inputValue, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("members.errors.addFailed"));
      setInputValue("");
      setSelectedUser(null);
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("members.addDialogTitle")}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("members.addDialogBody")}
        </Typography>
        <Stack spacing={2}>
          <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(o) => (typeof o === "string" ? o : `${o.name} (${o.email})`)}
            loading={searching}
            onInputChange={(e, val) => setInputValue(val)}
            onChange={(e, val) => setSelectedUser(typeof val === "string" ? null : val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("members.nameOrEmailLabel")}
                autoFocus
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searching ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {assignable.map((r) => (
              <MenuItem key={r} value={r}>
                {t(`roles.${r}.label`)}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={!inputValue.trim() || saving} onClick={handleAdd}>
          {saving ? t("members.adding") : t("members.addButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

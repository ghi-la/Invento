import { Box, Chip, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import type { Role } from '../types/user';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setRoleForUser } from '../hooks/slices/authSlice';
import { usePermissions } from '../auth/usePermissions';

const ROLE_OPTIONS: Role[] = ['owner', 'admin', 'editor', 'viewer'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { workspace, role, has } = usePermissions();
  const users = useAppSelector((s) => s.auth.workspaces);

  // Settings only makes sense with an active workspace
  if (!workspace) return null;

  if (!has('workspace.manage')) {
    // render inline denied (route-level also exists)
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography color="text.secondary">
            You don’t have permission to manage this workspace.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Settings
            </Typography>
            <Typography color="text.secondary">Workspace: {workspace.name}</Typography>
          </Box>
          <Chip label={`Your role: ${role}`} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Members
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Demo UI: change roles locally (frontend state only).
        </Typography>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {workspace.members.map((m) => (
            <Paper key={m.userId} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography fontWeight={700}>{m.userId}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Member
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id={`role-${m.userId}`}>Role</InputLabel>
                <Select
                  labelId={`role-${m.userId}`}
                  label="Role"
                  value={m.role}
                  onChange={(e) =>
                    dispatch(
                      setRoleForUser({
                        workspaceId: workspace.id,
                        userId: m.userId,
                        role: e.target.value as Role,
                      })
                    )
                  }
                >
                  {ROLE_OPTIONS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

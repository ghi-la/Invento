import { createTheme } from '@mui/material/styles';

// Keep the theme light and neutral (Sortly-like). You can tweak these later.
const InventoTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#910029' },
    secondary: { main: '#39404b' },
    background: {
      default: '#f6f7fb',
      paper: '#ffffff',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h3: { fontWeight: 850 },
    h4: { fontWeight: 800 },
    h6: { fontWeight: 750 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(145, 0, 41, 0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(145, 0, 41, 0.12)',
          },
        },
      },
    },
  },
});

export default InventoTheme;

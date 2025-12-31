import { createTheme } from '@mui/material';

const primaryMainColor = '#910029';
const primaryLightColor = '#9b4d63ff';
const primaryDarkColor = '#6f0019';
const primaryContrastTextColor = '#ffffff';

const InventoTheme = createTheme({
  palette: {
    primary: {
          main: primaryMainColor,
          light: primaryLightColor,
          dark: primaryDarkColor,
            contrastText: primaryContrastTextColor,
    },
    secondary: {
      main: '#39404b',
    },
    background: {
      default: '#ecf4f7',
      paper: '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          padding: '1em',
          height: '100vh',
          justifyContent: 'space-between',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
              //   border: '1px solid #e0e0e0',
            backgroundColor: primaryLightColor,
              borderRadius: '4px',
          margin: '4px 0',
          transition: 'background 0.2s',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          cursor: 'pointer',
        },
      },
    },
  },
});

export default InventoTheme;

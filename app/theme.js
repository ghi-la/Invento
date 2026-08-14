"use client";
import { createTheme } from "@mui/material/styles";

// Design tokens
// Ink (near-black graphite) for structural surfaces + Warehouse amber as the single
// working accent — reads like hazard signage / pallet labels rather than generic
// "SaaS blue". Numbers (SKUs, quantities) get a monospace treatment so they scan
// fast, the way they would on a physical tally sheet.
const ink = "#1E2530";
const amber = "#F2A93B";
const steel = "#5B7FDB";
const bg = "#F5F6F8";

const fontSans =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const fontMono =
  '"SF Mono","Roboto Mono","JetBrains Mono",Menlo,Consolas,"Courier New",monospace';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: ink, contrastText: "#fff" },
    secondary: { main: steel },
    warning: { main: amber, contrastText: ink },
    error: { main: "#D64545" },
    success: { main: "#2E7D32" },
    background: { default: bg, paper: "#FFFFFF" },
    text: { primary: "#1B222C", secondary: "#5C6673" },
    divider: "#E3E6EB",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: fontSans,
    h1: { fontFamily: fontSans, fontWeight: 700 },
    h2: { fontFamily: fontSans, fontWeight: 700 },
    h3: { fontFamily: fontSans, fontWeight: 700 },
    h4: { fontFamily: fontSans, fontWeight: 700, letterSpacing: -0.5 },
    h5: { fontFamily: fontSans, fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontFamily: fontSans, fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingTop: 8, paddingBottom: 8 },
        containedWarning: { color: ink },
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: ink } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E3E6EB",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});

// exported so number-heavy UI (quantities, SKUs, barcodes) can opt into the mono stack
theme.customFonts = { mono: fontMono, sans: fontSans };

export default theme;

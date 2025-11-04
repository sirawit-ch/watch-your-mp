"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6", // blue-500
    },
    secondary: {
      main: "#a855f7", // purple-500
      light: "#c084fc", // purple-400
      lighter: "#f3e8ff", // purple-100
    },
    success: {
      main: "#22c55e", // green-500
      lighter: "#dcfce7", // green-100
    },
    error: {
      main: "#ef4444", // red-500
      lighter: "#fee2e2", // red-100
    },
    warning: {
      main: "#eab308", // yellow-500
      lighter: "#fef9c3", // yellow-100
    },
  },
  typography: {
    fontFamily: "var(--font-sarabun), Sarabun, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "var(--font-sarabun), Sarabun, sans-serif",
        },
      },
    },
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

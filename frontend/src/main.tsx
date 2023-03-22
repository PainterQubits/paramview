import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App } from "@/components";
import theme from "@/theme";
import "@fontsource/roboto/latin-400.css";

// Render app in root element with CSS baseline and theme
createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme()}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

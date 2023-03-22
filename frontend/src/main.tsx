import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App } from "@/components";
import theme from "@/theme";

import "@fontsource/roboto/latin-400.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme()}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

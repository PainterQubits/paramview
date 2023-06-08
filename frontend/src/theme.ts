import { createTheme, PaletteMode } from "@mui/material";
import { indigo, green, red } from "@mui/material/colors";

// Add colors "added" and "removed" to the pallete
declare module "@mui/material" {
  interface Palette {
    added: Palette["primary"];
    removed: Palette["primary"];
  }

  interface PaletteOptions {
    added: PaletteOptions["primary"];
    removed: PaletteOptions["primary"];
  }
}

/** Create an MUI theme in the specified pallete mode. */
export default function theme(mode: PaletteMode = "light") {
  const theme = createTheme({
    palette: {
      mode,
      primary: indigo,
      secondary: {
        main: "#fff",
      },
      added: {
        main: green[200],
      },
      removed: {
        main: red[200],
      },
    },
    typography: {
      h1: {
        fontSize: "2rem",
      },
      h2: {
        fontSize: "1.625rem",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            padding: "5px 11px",
            whiteSpace: "nowrap",
          },
          startIcon: {
            marginRight: "5px",
          },
          endIcon: {
            marginLeft: "5px",
          },
        },
      },
    },
  });

  console.log(theme);

  return theme;
}

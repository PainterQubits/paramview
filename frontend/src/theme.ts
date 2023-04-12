import { createTheme, PaletteMode } from "@mui/material";
import { indigo } from "@mui/material/colors";

/** Create an MUI theme in the specified pallete mode. */
export default function theme(mode: PaletteMode = "light") {
  return createTheme({
    palette: {
      mode,
      primary: indigo,
      secondary: {
        main: "#fff",
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
  });
}

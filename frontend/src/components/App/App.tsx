import { Box } from "@mui/material";
import { Header } from "@/components";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

/** The entire application. */
export default function App() {
  return (
    <Box sx={appSx}>
      <Header />
    </Box>
  );
}

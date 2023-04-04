import { ErrorBoundary } from "react-error-boundary";
import { Box } from "@mui/material";
import { Header, Params } from "@/components";
import Error from "./Error";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

/** The entire application. */
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Box sx={appSx}>
        <Header />
        <Params />
      </Box>
    </ErrorBoundary>
  );
}

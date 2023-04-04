import { ErrorBoundary } from "react-error-boundary";
import { Box } from "@mui/material";
import { Header } from "@/components";
import ErrorFallback from "./ErrorFallback";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

/** The entire application. */
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Box sx={appSx}>
        <Header />
      </Box>
    </ErrorBoundary>
  );
}

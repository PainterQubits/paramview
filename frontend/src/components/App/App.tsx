import { ErrorBoundary } from "react-error-boundary";
import { Box } from "@mui/material";
import { Header, ParamSection } from "@/components";
import ErrorAlert from "./ErrorAlert";
import SocketIO from "./SocketIO";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

const contentSx = {
  display: "flex",
  justifyContent: "center",
  flex: 1,
  overflow: "hidden",
};

/** Root component for the entire app. */
export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorAlert}
      onReset={() => window.location.reload()}
    >
      <SocketIO />
      <Box sx={appSx}>
        <Header />
        <Box sx={contentSx}>
          <ParamSection />
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

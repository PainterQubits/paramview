import { ErrorBoundary } from "react-error-boundary";
import { Box } from "@mui/material";
import { Header, ParamSection } from "@/components";
import ErrorAlert from "./ErrorAlert";
import useBeforeUnload from "./useBeforeUnload";
import useSocketIO from "./useSocketIO";

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

/**
 * Global hooks to use. This component does not render anything. The hooks are used in a
 * separate component so they are within the error boundary.
 */
function GlobalHooks() {
  useBeforeUnload();
  useSocketIO();

  return null;
}

/** Root component for the entire app. */
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorAlert}>
      <GlobalHooks />
      <Box sx={appSx}>
        <Header />
        <Box sx={contentSx}>
          <ParamSection />
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

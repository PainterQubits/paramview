import { ErrorBoundary } from "react-error-boundary";
import { Box } from "@mui/material";
import { Header, ParamSection } from "@/components";
import Error from "./Error";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

const contentSx = {
  display: "flex",
  flex: 1,
  overflow: "hidden",
};

/** The entire application. */
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Box sx={appSx}>
        <Header />
        <Box sx={contentSx}>
          <ParamSection />
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

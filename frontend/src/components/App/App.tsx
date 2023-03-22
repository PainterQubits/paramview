import { Box } from "@mui/material";
import { Header } from "@/components";

const appSx = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
};

export default function Test() {
  return (
    <Box sx={appSx}>
      <Header />
    </Box>
  );
}

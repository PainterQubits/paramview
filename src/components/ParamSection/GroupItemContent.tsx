import { Box, Typography } from "@mui/material";

const itemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pr: 2,
  py: 0.25,
};

const nameContainerSx = {
  display: "flex",
  alignItems: "baseline",
  columnGap: 1.25,
};

type ParamItemContentProps = {
  /** Name to display. */
  name: string;
  /** Class name to display, if any. */
  className: string | null;
  /** Timestamp to display, if any. */
  timestamp: string | null;
};

/** Item content for a Group. */
export default function GroupItemContent({
  name,
  className,
  timestamp,
}: ParamItemContentProps) {
  return (
    <Box sx={itemContentSx}>
      <Box sx={nameContainerSx}>
        <Typography>{name}</Typography>
        {(className !== null || timestamp !== null) && (
          <Typography variant="body2" color="text.secondary">
            {className !== null ? className : ""}
            {timestamp !== null ? ` (${timestamp})` : ""}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

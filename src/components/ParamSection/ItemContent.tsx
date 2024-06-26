import { SxProps, Box, Typography } from "@mui/material";

const itemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pr: 2,
  minHeight: "28px",
};

const nameContainerSx = {
  display: "flex",
  alignItems: "center",
  columnGap: 1.25,
  whiteSpace: "nowrap",
};

type ParamItemContentProps = {
  /** Name to display. */
  name: string;
  /** Class name to display, if any. */
  className: string | null;
  /** Timestamp to display, if any. */
  timestamp: string | null;
  /** Extra styles. */
  extraSx?: SxProps;
  /** Children to include on the right of this item. */
  children?: React.ReactNode;
};

/** Conent of an item in a parameter list. */
export default function ItemContent({
  name,
  className,
  timestamp,
  extraSx,
  children,
}: ParamItemContentProps) {
  return (
    <Box sx={{ ...itemContentSx, ...extraSx }}>
      <Box sx={nameContainerSx}>
        <Typography>{name}</Typography>
        {(className !== null || timestamp !== null) && (
          <Typography variant="body2" color="text.secondary">
            {className !== null ? className : ""}
            {timestamp !== null ? ` (${timestamp})` : ""}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

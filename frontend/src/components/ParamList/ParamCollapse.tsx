import { useState } from "react";
import { Collapse, ListItemButton, ListItemIcon } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";

const listItemButtonSx = {
  py: 0,
};

const leftBorderSx = {
  borderLeft: 1,
  borderColor: "divider",
};

const iconSx = {
  minWidth: 24,
};

const collapseSx = {
  borderTop: 1,
  borderColor: "divider",
};

type ParamCollapseProps = {
  defaultOpen: boolean;
  leftBorder?: boolean;
  itemContent: JSX.Element;
  children: React.ReactNode;
};

export default function ParamCollapseItem({
  defaultOpen,
  leftBorder = false,
  itemContent,
  children,
}: ParamCollapseProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <ListItemButton
        disableGutters
        sx={[listItemButtonSx, leftBorder ? leftBorderSx : {}]}
        onClick={() => setOpen(!open)}
      >
        <ListItemIcon sx={iconSx}>
          {open ? <ExpandMore /> : <ChevronRight />}
        </ListItemIcon>
        {itemContent}
      </ListItemButton>
      <Collapse sx={collapseSx} in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
}

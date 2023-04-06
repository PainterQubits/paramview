import { useState } from "react";
import { Collapse, ListItemButton, ListItemIcon } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";

const listItemButtonSx = {
  py: 0,
  borderLeft: 1,
  borderColor: "divider",
  background: "white",
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
  itemContent: JSX.Element;
  children: React.ReactNode;
};

export default function ParamCollapseItem({
  defaultOpen,
  itemContent,
  children,
}: ParamCollapseProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <ListItemButton disableGutters sx={listItemButtonSx} onClick={() => setOpen(!open)}>
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

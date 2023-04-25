import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Collapse, ListItemButton, ListItemIcon } from "@mui/material";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { collapseAtom } from "@/atoms/paramList";

const listItemButtonSx = {
  py: 0,
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
  /** Whether this component is open by default. Default value is false. */
  defaultOpen: boolean;
  /** Item content to show in the button. */
  itemContent: JSX.Element;
  /** Children that are shown below when this component is open. */
  children: React.ReactNode;
};

/**
 * Button containing the given item content and an icon indicating whether this component
 * is open or closed. Displays children below when open.
 */
export default function ParamCollapseItem({
  defaultOpen,
  itemContent,
  children,
}: ParamCollapseProps) {
  const [collapse] = useAtom(collapseAtom);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => setOpen(defaultOpen), [collapse, defaultOpen]);

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

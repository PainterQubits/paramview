import { Suspense } from "react";
import { useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Data } from "@/types";
import { isLeaf } from "@/utils/type";
import { leafToString, getType, getTimestamp, getChildren } from "@/utils/data";
import { dataAtom } from "@/atoms/api";
import LeafItemContent from "./LeafItemContent";
import GroupItemContent from "./GroupItemContent";
import ParamCollapse from "./CollapseButton";

const paramListSx = {
  display: "flex",
  flex: 1,
  overflow: "hidden",
};

const paramListContentsSx = {
  flexBasis: "42rem",
  overflowY: "auto",
  borderRight: 1,
  borderColor: "divider",
  background: "#F4F4F4",
};

const rootListSx = {
  borderBottom: 1,
  borderColor: "divider",
};

const sublistSx = {
  ml: 2,
};

const listItemSx = {
  display: "block",
  borderBottom: 1,
  borderColor: "divider",
  "&:last-child": {
    borderBottom: "none",
  },
};

type ParamSublistProps = {
  items: [string, Data][];
  root?: boolean;
};

function ParamSublist({ items, root = false }: ParamSublistProps) {
  return (
    <List disablePadding sx={root ? rootListSx : sublistSx}>
      {items.map(([name, data]) => (
        <ListItem key={name} sx={listItemSx} disableGutters disablePadding>
          {isLeaf(data) ? (
            <LeafItemContent name={name} value={leafToString(data)} />
          ) : (
            <ParamCollapse
              defaultOpen={root}
              itemContent={
                <GroupItemContent
                  name={name}
                  type={getType(data)}
                  timestamp={getTimestamp(data)}
                />
              }
            >
              {<ParamSublist items={getChildren(data)} />}
            </ParamCollapse>
          )}
        </ListItem>
      ))}
    </List>
  );
}

function ParamListContents() {
  const [data] = useAtom(dataAtom);

  return (
    <Box sx={paramListContentsSx}>
      <ParamSublist items={[["root", data]]} root />
    </Box>
  );
}

export default function ParamList() {
  return (
    <Box sx={paramListSx}>
      <Suspense>
        <ParamListContents />
      </Suspense>
    </Box>
  );
}

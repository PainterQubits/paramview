import { Suspense } from "react";
import { useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Data } from "@/types";
import { isLeaf } from "@/utils/type";
import { leafToString, getType, getChildren } from "@/utils/data";
import { dataAtom } from "@/atoms/api";
import ParamItemContent from "./ParamItemContent";
import ParamCollapse from "./ParamCollapse";

const paramListContentsSx = {
  overflowY: "auto",
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
  "&:last-child": { borderBottom: "none" },
};

type ParamSublistProps = {
  items: [string, Data][];
  root?: boolean;
};

function ParamSublist({ items, root = false }: ParamSublistProps) {
  return (
    <List disablePadding sx={!root ? sublistSx : {}}>
      {items.map(([name, data]) => (
        <ListItem key={name} sx={listItemSx} disableGutters disablePadding>
          {isLeaf(data) ? (
            <ParamItemContent leftPadding name={name} value={leafToString(data)} />
          ) : (
            <ParamCollapse
              defaultOpen={root}
              itemContent={<ParamItemContent name={name} value={getType(data)} />}
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
    <Suspense>
      <ParamListContents />
    </Suspense>
  );
}

import { Suspense } from "react";
import { useAtom } from "jotai";
import { List, ListItem } from "@mui/material";
import { Data } from "@/types";
import { isLeaf } from "@/utils/type";
import { getType, getTimestamp, getChildren } from "@/utils/data";
import { dataAtom } from "@/atoms/api";
import LeafItemContent from "./LeafItemContent";
import GroupItemContent from "./GroupItemContent";
import ParamCollapse from "./CollapseButton";

const rootListSx = {
  borderBottom: 1,
  borderColor: "divider",
  backgroundColor: "grey.100",
  overflowY: "auto",
};

const sublistSx = {
  ml: 1.5,
  borderLeft: 1,
  borderColor: "divider",
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
    <List disablePadding sx={root ? rootListSx : sublistSx}>
      {items.map(([name, data]) => (
        <ListItem key={name} sx={listItemSx} disableGutters disablePadding>
          {isLeaf(data) ? (
            <LeafItemContent name={name} value={data} />
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

  return <ParamSublist items={[["root", data]]} root />;
}

export default function ParamList() {
  return (
    <Suspense>
      <ParamListContents />
    </Suspense>
  );
}

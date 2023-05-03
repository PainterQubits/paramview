import { Suspense } from "react";
import { useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Data } from "@/types";
import { isLeaf } from "@/utils/type";
import { getType, getTimestamp, getChildren } from "@/utils/data";
import { dataAtom } from "@/atoms/api";
import LeafItemContent from "./LeafItemContent";
import GroupItemContent from "./GroupItemContent";
import CollapseItem from "./CollapseItem";

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
  /** List of names and Data to display in this sublist. */
  items: [string, Data][];
  /** Whether this is the root list. */
  root?: boolean;
};

/** Sublist in the parameter list. */
function ParamSublist({ items, root = false }: ParamSublistProps) {
  return (
    <List
      data-testid={root ? "parameter-list" : undefined}
      disablePadding
      sx={root ? rootListSx : sublistSx}
    >
      {items.map(([name, data]) => (
        <ListItem key={name} sx={listItemSx} disableGutters disablePadding>
          {isLeaf(data) ? (
            <LeafItemContent name={name} value={data} />
          ) : (
            <CollapseItem
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
            </CollapseItem>
          )}
        </ListItem>
      ))}
    </List>
  );
}

/**
 * Contents of the parameter list, which must be wrapped by Suspense since it could be
 * loading.
 */
function ParamListContents() {
  const [data] = useAtom(dataAtom);

  return <ParamSublist items={[["root", data]]} root />;
}

/** List of parameter data. */
export default function ParamList() {
  return (
    <Suspense fallback={<Box data-testid="parameter-list-loading" />}>
      <ParamListContents />
    </Suspense>
  );
}

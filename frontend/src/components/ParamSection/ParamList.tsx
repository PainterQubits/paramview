import { Suspense } from "react";
import { useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Path } from "@/types";
import { isLeaf } from "@/utils/type";
import { getTypeString, getTimestamp, getData, getChildrenNames } from "@/utils/data";
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

type ParamListItemProps = {
  /** Path to the data this item represents. */
  path: Path;
};

function ParamListItem({ path }: ParamListItemProps) {
  const [rootData] = useAtom(dataAtom);

  const data = getData(rootData, path);

  const name = path.length > 0 ? path[path.length - 1] : "root";

  return (
    <ListItem
      data-testid={`parameter-list-item-${name}`}
      sx={listItemSx}
      disableGutters
      disablePadding
    >
      {isLeaf(data) ? (
        <LeafItemContent name={name} path={path} />
      ) : (
        <CollapseItem
          defaultOpen={path.length === 0}
          itemContent={
            <GroupItemContent
              name={name}
              type={getTypeString(data)}
              timestamp={getTimestamp(data)}
            />
          }
        >
          {
            <List disablePadding sx={sublistSx}>
              {getChildrenNames(data).map((childName) => (
                <ParamListItem key={childName} path={[...path, childName]} />
              ))}
            </List>
          }
        </CollapseItem>
      )}
    </ListItem>
  );
}

/** List of parameter data. */
export default function ParamList() {
  return (
    <Suspense fallback={<Box data-testid="parameter-list-loading" />}>
      <List data-testid="parameter-list" disablePadding sx={rootListSx}>
        <ParamListItem path={[]} />
      </List>
    </Suspense>
  );
}

import { Suspense } from "react";
import { atom, useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Path } from "@/types";
import { isLeaf } from "@/utils/type";
import { getTypeString, getTimestamp, getData, getChildrenNames } from "@/utils/data";
import { originalDataAtom } from "@/atoms/api";
import { editModeAtom, editedDataAtom } from "@/atoms/paramList";
import LeafItemContent from "./LeafItemContent";
import GroupItemContent from "./GroupItemContent";
import CollapseItem from "./CollapseItem";

const rootDataAtom = atom((get) => {
  // Defined outside conditional so Jotai registers both as dependencies
  const editedData = get(editedDataAtom);
  const originalData = get(originalDataAtom);
  return get(editModeAtom) ? editedData : originalData;
});

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

/**
 * Item in the parameter list displaying the data at the given path. If the data is a
 * group, then the item will contain a sublist.
 */
function ParamListItem({ path }: ParamListItemProps) {
  const [rootData] = useAtom(rootDataAtom);

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
        <LeafItemContent name={name} leaf={data} path={path} />
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
    <Suspense fallback={<Box />}>
      <List disablePadding sx={rootListSx}>
        <ParamListItem path={[]} />
      </List>
    </Suspense>
  );
}

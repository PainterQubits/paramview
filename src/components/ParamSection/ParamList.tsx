import { useMemo, Suspense } from "react";
import { useAtom } from "jotai";
import { Box, List, ListItem } from "@mui/material";
import { Path } from "@/types";
import { isLeaf, unwrapParamData, getData } from "@/utils/data";
import { originalDataAtom } from "@/atoms/api";
import { editModeAtom, editedDataAtom } from "@/atoms/paramList";
import ItemContent from "./ItemContent";
import LeafItemContent from "./LeafItemContent";
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

/**
 * Item in the parameter list displaying the data at the given path. If the data is a
 * group, then the item will contain a sublist.
 */
function ParamListItem({ path }: ParamListItemProps) {
  const [editMode] = useAtom(editModeAtom);
  const [originalData] = useAtom(originalDataAtom);
  const [editedData] = useAtom(editedDataAtom);

  const { className, lastUpdated, innerData } = useMemo(() => {
    const unwrappedOriginalData = unwrapParamData(getData(originalData, path));
    const { lastUpdated } = unwrappedOriginalData;

    const { className, innerData } = editMode
      ? unwrapParamData(getData(editedData, path))
      : unwrappedOriginalData;

    return { className, lastUpdated, innerData };
  }, [originalData, path, editMode, editedData]);

  const name = path.length > 0 ? path[path.length - 1] : "root";

  return (
    <ListItem
      data-testid={`parameter-list-item-${name}`}
      sx={listItemSx}
      disableGutters
      disablePadding
    >
      {isLeaf(innerData) ? (
        <LeafItemContent
          name={name}
          className={className}
          timestamp={lastUpdated}
          leaf={innerData}
          path={path}
        />
      ) : (
        <CollapseItem
          defaultOpen={path.length === 0}
          itemContent={
            <ItemContent name={name} className={className} timestamp={lastUpdated} />
          }
        >
          {
            <List disablePadding sx={sublistSx}>
              {Object.keys(innerData.data).map((childName) => (
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

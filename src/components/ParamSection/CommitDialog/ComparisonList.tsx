import { atom, useAtom } from "jotai";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography, List, ListItem } from "@mui/material";
import { DataType, Data, Diff } from "@/types";
import { isLeaf, unwrapParamData, getData } from "@/utils/data";
import { getDataDiff } from "@/utils/dataDiff";
import { commitHistoryAtom, latestDataAtom } from "@/atoms/api";
import { editedDataAtom } from "@/atoms/paramList";
import ItemContent from "../ItemContent";
import CollapseItem from "../CollapseItem";
import LeafItemContent from "./LeafItemContent";

/** Description for the latest commit. */
const latestCommitDescriptionAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const { id, message } = commitHistory[commitHistory.length - 1];
  return `latest commit (${id}: ${message})`;
});

const comparisonListContainerSx = {
  display: "flex",
  flexDirection: "column",
  rowGap: 2,
};

const rootListSx = {
  border: 1,
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

type DataListItemProps = {
  /** Name of the data. */
  name: string;
  /** The data object. */
  data: Data;
  /** Diff status, either "old" or "new". */
  status: "old" | "new";
};

/**
 * List item displaying Data.
 *
 * If status is "old", it will use a red background color, and if status is "new", it will
 * display a green background color.
 */
function DataListItem({ name, data, status }: DataListItemProps) {
  const backgroundColor = status === "old" ? "removed.main" : "added.main";
  const { className, lastUpdated, innerData } = unwrapParamData(data);

  return (
    <ListItem
      data-testid={`comparison-list-item-${status}-${name}`}
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
          backgroundColor={backgroundColor}
        />
      ) : (
        <CollapseItem
          backgroundColor={backgroundColor}
          defaultOpen={true}
          itemContent={
            <ItemContent name={name} className={className} timestamp={lastUpdated} />
          }
        >
          <List disablePadding sx={sublistSx}>
            {Object.entries(innerData.data).map(([childName, childData]) => (
              <DataListItem
                key={childName}
                name={childName}
                data={childData}
                status={status}
              />
            ))}
          </List>
        </CollapseItem>
      )}
    </ListItem>
  );
}

type DataDiffListItemProps = {
  /** Name of the data the DataDiff represents, or undefined if this is the root. */
  name?: string;
  /** The data diff object to represent. */
  dataDiff: Data<Diff>;
};

/**
 * List item displaying a DataDiff.
 *
 * If the DataDiff is a Group, it will render a sub-list. Otherwise, It will render an
 * item in red displaying the old data, if present, and an item in green displaying the
 * new data, if present.
 */
function DataDiffListItem({ name: nameOrUndefined, dataDiff }: DataDiffListItemProps) {
  const root = nameOrUndefined === undefined;
  const name = root ? "root" : nameOrUndefined;
  const { className, lastUpdated, innerData } = unwrapParamData(dataDiff);

  return (
    <>
      {innerData.type === DataType.Diff ? (
        <>
          {innerData.old !== undefined && (
            <DataListItem name={name} data={innerData.old} status="old" />
          )}
          {innerData.new !== undefined && (
            <DataListItem name={name} data={innerData.new} status="new" />
          )}
        </>
      ) : (
        <ListItem
          data-testid={`comparison-list-item-${name}`}
          sx={listItemSx}
          disableGutters
          disablePadding
        >
          <CollapseItem
            defaultOpen={true}
            itemContent={
              <ItemContent name={name} className={className} timestamp={lastUpdated} />
            }
          >
            <List disablePadding sx={sublistSx}>
              {Object.keys(innerData.data).map((childName) => {
                const childDataDiff = getData(dataDiff, [childName]);

                return (
                  childDataDiff && (
                    <DataDiffListItem
                      key={childName}
                      name={childName}
                      dataDiff={childDataDiff}
                    />
                  )
                );
              })}
            </List>
          </CollapseItem>
        </ListItem>
      )}
    </>
  );
}

type ComparisonListProps = {
  /**
   * Whether this component should update in response to database changes. Intended to be
   * true in general, but false when the commit is already in progress.
   */
  shouldUpdate: boolean;
};

/** List displaying the difference between the current edited data and the latest data. */
export default function ComparisonList({ shouldUpdate }: ComparisonListProps) {
  const [latestData] = useAtom(latestDataAtom);
  const [editedData] = useAtom(editedDataAtom);
  const [latestCommitDescription] = useAtom(latestCommitDescriptionAtom);

  const calcDataDiff = useCallback(
    () => getDataDiff(latestData, editedData),
    [latestData, editedData],
  );

  const [dataDiff, setDataDiff] = useState(calcDataDiff);

  useEffect(() => {
    if (shouldUpdate) {
      const newDataDiff = calcDataDiff();
      setDataDiff(newDataDiff);
    }
  }, [shouldUpdate, calcDataDiff]);

  return (
    <Box sx={comparisonListContainerSx}>
      <Typography data-testid="commit-changes-message">
        {dataDiff === null
          ? `No changes from ${latestCommitDescription}`
          : `Changes from ${latestCommitDescription}`}
      </Typography>
      {dataDiff !== null && (
        <List disablePadding sx={rootListSx}>
          <DataDiffListItem dataDiff={dataDiff} />
        </List>
      )}
    </Box>
  );
}

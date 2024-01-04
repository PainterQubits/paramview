import { atom, useAtom } from "jotai";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography, List, ListItem } from "@mui/material";
import { DataDiff, Data } from "@/types";
import { isLeaf, isDataChange } from "@/utils/type";
import { getTypeString, getTimestamp, getData, getChildrenNames } from "@/utils/data";
import { getDataDiff } from "@/utils/dataDiff";
import { commitHistoryAtom, latestDataAtom } from "@/atoms/api";
import { editedDataAtom } from "@/atoms/paramList";
import GroupItemContent from "../GroupItemContent";
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

  return (
    <ListItem
      data-testid={`comparison-list-item-${status}-${name}`}
      sx={listItemSx}
      disableGutters
      disablePadding
    >
      {isLeaf(data) ? (
        <LeafItemContent name={name} leaf={data} backgroundColor={backgroundColor} />
      ) : (
        <CollapseItem
          backgroundColor={backgroundColor}
          defaultOpen={true}
          itemContent={
            <GroupItemContent
              name={name}
              type={getTypeString(data)}
              timestamp={getTimestamp(data)}
            />
          }
        >
          <List disablePadding sx={sublistSx}>
            {getChildrenNames(data).map((childName) => (
              <DataListItem
                key={childName}
                name={childName}
                data={getData(data, [childName])}
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
  dataDiff: DataDiff;
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

  return (
    <>
      {isDataChange(dataDiff) ? (
        <>
          {dataDiff.__old !== undefined && (
            <DataListItem name={name} data={dataDiff.__old} status="old" />
          )}
          {dataDiff.__new !== undefined && (
            <DataListItem name={name} data={dataDiff.__new} status="new" />
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
              <GroupItemContent
                name={name}
                type={getTypeString(dataDiff)}
                timestamp={getTimestamp(dataDiff)}
              />
            }
          >
            <List disablePadding sx={sublistSx}>
              {getChildrenNames(dataDiff).map((childName) => {
                const childDataDiff = getData(dataDiff as Data, [childName]) as
                  | DataDiff
                  | undefined;

                return childDataDiff === undefined ? null : (
                  <DataDiffListItem
                    key={childName}
                    name={childName}
                    dataDiff={childDataDiff}
                  />
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

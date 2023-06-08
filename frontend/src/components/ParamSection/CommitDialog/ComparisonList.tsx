import { atom, useAtom } from "jotai";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography, List, ListItem } from "@mui/material";
import { DataDiff, Data } from "@/types";
import { isLeaf, isDataChange } from "@/utils/type";
import { getTypeString, getData, getChildrenNames } from "@/utils/data";
import { getDataDiff } from "@/utils/dataDiff";
import { commitHistoryAtom, latestDataAtom } from "@/atoms/api";
import { editedDataAtom } from "@/atoms/paramList";
import LeafItemContent from "./LeafItemContent";
import GroupItemContent from "../GroupItemContent";
import CollapseItem from "../CollapseItem";

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
  name: string;
  data: Data;
  status: "old" | "new";
};

function DataListItem({ name, data, status }: DataListItemProps) {
  const backgroundColor = status === "old" ? "removed.main" : "added.main";

  return (
    <ListItem sx={{ ...listItemSx, backgroundColor }} disableGutters disablePadding>
      {isLeaf(data) ? (
        <LeafItemContent name={name} leaf={data} />
      ) : (
        <CollapseItem
          backgroundColor={backgroundColor}
          defaultOpen={true}
          itemContent={<GroupItemContent name={name} type={getTypeString(data)} />}
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
  name?: string;
  dataDiff: DataDiff;
};

function DataDiffListItem({ name: nameOrUndefined, dataDiff }: DataDiffListItemProps) {
  const root = nameOrUndefined === undefined;
  const name = root ? "root" : nameOrUndefined;

  return (
    <ListItem sx={listItemSx} disableGutters disablePadding>
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
        <CollapseItem
          defaultOpen={true}
          itemContent={<GroupItemContent name={name} type={getTypeString(dataDiff)} />}
        >
          <List disablePadding sx={sublistSx}>
            {getChildrenNames(dataDiff).map((childName) => (
              <DataDiffListItem
                key={childName}
                name={childName}
                dataDiff={getData(dataDiff as Data, [childName]) as DataDiff}
              />
            ))}
          </List>
        </CollapseItem>
      )}
    </ListItem>
  );
}

type ComparisonListProps = {
  /** Whether this component should update changes. */
  shouldUpdate: boolean;
};

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
  }, [shouldUpdate, calcDataDiff, latestData, editedData]);

  return (
    <Box sx={comparisonListContainerSx}>
      {dataDiff === null ? (
        <Typography>{`No changes from ${latestCommitDescription}`}</Typography>
      ) : (
        <>
          <Typography>{`Changes from ${latestCommitDescription}`}</Typography>
          <List disablePadding sx={rootListSx}>
            <DataDiffListItem dataDiff={dataDiff} />
          </List>
        </>
      )}
    </Box>
  );
}

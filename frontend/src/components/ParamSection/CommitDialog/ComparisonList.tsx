import { atom, useAtom } from "jotai";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography, List, ListItem } from "@mui/material";
import { Data } from "@/types";
import { isLeaf } from "@/utils/type";
import {
  leafToString,
  getTypeString,
  getTimestamp,
  getData,
  getChildrenNames,
} from "@/utils/data";
import { getDataDiff } from "@/utils/dataDiff";
import { commitHistoryAtom, latestDataAtom } from "@/atoms/api";
import { editedDataAtom } from "@/atoms/paramList";
import GroupItemContent from "../GroupItemContent";
import CollapseItem from "../CollapseItem";

const latestCommitDescriptionAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const { id, message } = commitHistory[commitHistory.length - 1];
  return `commit ${id} (${message})`;
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

const leafItemContentSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flex: 1,
  pl: "24px",
  pr: 2,
  minHeight: "28px",
  background: "white",
};

type ComparisonListItem = {
  name?: string;
  dataDiff: Data | undefined;
};

function ComparisonListItem({ name: nameOrUndefined, dataDiff }: ComparisonListItem) {
  const root = nameOrUndefined === undefined;
  const name = root ? "root" : nameOrUndefined;

  return (
    <ListItem sx={listItemSx} disableGutters disablePadding>
      {dataDiff === undefined || isLeaf(dataDiff) ? (
        <Box sx={leafItemContentSx}>
          <Typography>{name}</Typography>
          <Typography align="right">
            {dataDiff === undefined ? "<deleted>" : leafToString(dataDiff, false)}
          </Typography>
        </Box>
      ) : (
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
            {getChildrenNames(dataDiff).map((childName) => (
              <ComparisonListItem
                key={childName}
                name={childName}
                dataDiff={getData(dataDiff, [childName])}
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
      console.log(newDataDiff);
      setDataDiff(newDataDiff);
    }
  }, [shouldUpdate, calcDataDiff, latestData, editedData]);

  return (
    <Box sx={comparisonListContainerSx}>
      <Typography>{`Changes from ${latestCommitDescription}`}</Typography>
      <Typography>{JSON.stringify(dataDiff)}</Typography>
      {/* <List disablePadding sx={rootListSx}>
        <ComparisonListItem dataDiff={dataDiff} />
      </List> */}
    </Box>
  );
}

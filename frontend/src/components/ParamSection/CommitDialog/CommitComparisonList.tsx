import { diff } from "deep-object-diff";
import { atom, useAtom } from "jotai";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { commitHistoryAtom, latestDataAtom } from "@/atoms/api";
import { editedDataAtom } from "@/atoms/paramList";

const latestCommitDescriptionAtom = atom(async (get) => {
  const commitHistory = await get(commitHistoryAtom);
  const { id, message } = commitHistory[commitHistory.length - 1];
  return `commit ${id} (${message})`;
});

type CommitComparisonListProps = {
  /** Whether this component should update changes. */
  shouldUpdate: boolean;
};

export default function CommitComparisonList({
  shouldUpdate,
}: CommitComparisonListProps) {
  const [latestData] = useAtom(latestDataAtom);
  const [editedData] = useAtom(editedDataAtom);
  const [latestCommitDescription] = useAtom(latestCommitDescriptionAtom);

  const calcDataDiff = useCallback(
    () => diff({ root: latestData }, { root: editedData }),
    [latestData, editedData],
  );

  const [dataDiff, setDataDiff] = useState(calcDataDiff);

  useEffect(() => {
    if (shouldUpdate) {
      setDataDiff(calcDataDiff());
    }
  }, [shouldUpdate, calcDataDiff]);

  return (
    <Box>
      <Typography>{`Changes from ${latestCommitDescription}`}</Typography>
      <Typography data-testid="commit-dialog-changed">
        {JSON.stringify(dataDiff)}
      </Typography>
    </Box>
  );
}

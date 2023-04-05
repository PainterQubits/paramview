import { Suspense } from "react";
import { useAtom } from "jotai";
import { Box, Typography } from "@mui/material";
import { dataAtom } from "@/atoms/api";
import { isParamDict } from "@/utils/type";

function ParamText() {
  const [data] = useAtom(dataAtom);

  if (isParamDict(data)) {
    return (
      <Box>
        {Object.entries(data).map(([name, value]) => (
          <Typography key={name}>
            {name}: {JSON.stringify(value)}
          </Typography>
        ))}
      </Box>
    );
  }

  return <Typography>{JSON.stringify(data)}</Typography>;
}

export default function Params() {
  return (
    <Suspense>
      <ParamText />
    </Suspense>
  );
}

import { Suspense } from "react";
import { useAtom } from "jotai";
import { Typography } from "@mui/material";
import { paramsAtom } from "@/atoms/api";

function ParamText() {
  const [params] = useAtom(paramsAtom);

  return <Typography>{JSON.stringify(params)}</Typography>;
}

export default function Params() {
  return (
    <Suspense>
      <ParamText />
    </Suspense>
  );
}

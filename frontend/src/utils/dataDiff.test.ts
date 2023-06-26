import { List, Dict, ParamList, ParamDict, Struct, Param } from "@/types";
import { getDataDiff } from "./dataDiff";

describe("getDataDiff", () => {
  const leaf = 123;
  const group = {};

  it("compares two leaf data", () => {
    const dataDiff = getDataDiff(123, 456);

    expect(dataDiff).toEqual({ __old: 123, __new: 456 });
  });
});

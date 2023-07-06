import {
  DataDiff,
  Leaf,
  Datetime,
  Quantity,
  List,
  Dict,
  ParamList,
  ParamDict,
  Struct,
  Param,
} from "@/types";
import { getDataDiff } from "./dataDiff";

describe("leaf data", () => {
  const date1 = new Date();
  const date2 = new Date(date1.getTime() + 1e6);
  const datetime1: Datetime = {
    __type: "datetime.datetime",
    isoformat: date1.toISOString().replace("Z", "+00:00"),
  };
  const datetime2: Datetime = {
    __type: "datetime.datetime",
    isoformat: date1.toISOString().replace("Z", "+00:00"),
  };
  const datetime3: Datetime = {
    __type: "datetime.datetime",
    isoformat: date2.toISOString().replace("Z", "+00:00"),
  };

  const quantity1: Quantity = {
    __type: "astropy.units.quantity.Quantity",
    value: 123,
    unit: "m",
  };
  const quantity2: Quantity = {
    __type: "astropy.units.quantity.Quantity",
    value: 123,
    unit: "m",
  };
  const quantity3: Quantity = {
    __type: "astropy.units.quantity.Quantity",
    value: 456,
    unit: "m",
  };

  type leafTestParams = {
    oldLeaf: Leaf;
    newLeaf: Leaf;
    dataDiff: DataDiff;
  };

  it.each`
    oldLeaf      | newLeaf      | dataDiff
    ${123}       | ${123}       | ${null}
    ${"test1"}   | ${"test1"}   | ${null}
    ${datetime1} | ${datetime1} | ${null}
    ${datetime1} | ${datetime2} | ${null}
    ${quantity1} | ${quantity1} | ${null}
    ${quantity1} | ${quantity2} | ${null}
    ${123}       | ${456}       | ${{ __old: 123, __new: 456 }}
    ${"test1"}   | ${"test2"}   | ${{ __old: "test1", __new: "test2" }}
    ${datetime1} | ${datetime3} | ${{ __old: datetime1, __new: datetime3 }}
    ${quantity1} | ${quantity3} | ${{ __old: quantity1, __new: quantity3 }}
  `(
    "computes the diff of $oldLeaf and $newLeaf",
    ({ oldLeaf, newLeaf, dataDiff }: leafTestParams) =>
      expect(getDataDiff(oldLeaf, newLeaf)).toEqual(dataDiff),
  );
});

describe("group data", () => {
  // const param1: Param = {
  //   __type: "Child",
  //   __last_updated: {
  //     __type: "datetime.datetime",
  //     isoformat: "2023-01-02T00:00:00.000Z",
  //   },
  // };
  // const param2: Param = {
  //   __type: "Child",
  //   __last_updated: {
  //     __type: "datetime.datetime",
  //     isoformat: "2023-01-04T00:00:00.000Z",
  //   },
  // };
  // const param3: Param = {
  //   __type: "Child",
  //   __last_updated: {
  //     __type: "datetime.datetime",
  //     isoformat: "2023-01-03T00:00:00.000Z",
  //   },
  // };
  // const list: List = [123, "test", child1, child2, child3];
  // const dict = {
  //   number: 123,
  //   string: "test",
  //   child1,
  //   child2,
  //   child3,
  // } as unknown as Dict;
  // const paramList: ParamList = { __type: "ParamList", __items: list };
  // const paramDict: ParamDict = { __type: "ParamDict", ...dict };
  // const struct = { __type: "CustomStruct", ...dict } as unknown as Struct;
  // const emptyStruct = { __type: "EmptyStruct" } as unknown as Struct;
  // const param: Param = {
  //   __type: "CustomParam",
  //   __last_updated: {
  //     __type: "datetime.datetime",
  //     isoformat: "2023-01-01T00:00:00.000Z",
  //   },
  //   ...dict,
  // };
});

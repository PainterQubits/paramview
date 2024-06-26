// eslint-disable-next-line jest/no-commented-out-tests
/*
import {
  DataDiff,
  DataChange,
  Leaf,
  Group,
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
    ${123}       | ${"test"}    | ${{ __old: 123, __new: "test" }}
    ${true}      | ${datetime1} | ${{ __old: true, __new: datetime1 }}
    ${quantity1} | ${datetime1} | ${{ __old: quantity1, __new: datetime1 }}
  `(
    "computes the diff of $oldLeaf and $newLeaf",
    ({ oldLeaf, newLeaf, dataDiff }: leafTestParams) =>
      expect(getDataDiff(oldLeaf, newLeaf)).toEqual(dataDiff),
  );
});

describe("group data", () => {
  const list1: List = [123, "test1", 456, "test2"];
  const list2: List = [123, "test1", "test2"];
  const listDiff12: List<DataChange | undefined> = [
    undefined,
    undefined,
    { __old: 456, __new: "test2" },
    { __old: "test2", __new: undefined },
  ];
  const listDiff21: List<DataChange | undefined> = [
    undefined,
    undefined,
    { __old: "test2", __new: 456 },
    { __old: undefined, __new: "test2" },
  ];

  const dict1 = {
    number1: 123,
    string1: "test1",
    number2: 456,
  } as unknown as Dict;
  const dict2 = {
    string1: "test1",
    number2: 789,
    string2: "test2",
  } as unknown as Dict;
  const dictDiff12 = {
    number1: { __old: 123, __new: undefined },
    number2: { __old: 456, __new: 789 },
    string2: { __old: undefined, __new: "test2" },
  } as unknown as DataDiff;
  const dictDiff21 = {
    number1: { __old: undefined, __new: 123 },
    number2: { __old: 789, __new: 456 },
    string2: { __old: "test2", __new: undefined },
  } as unknown as DataDiff;

  const paramList1: ParamList = { __type: "ParamList", __items: list1 };
  const paramList2: ParamList = { __type: "ParamList", __items: list2 };
  const paramListDiff12: DataDiff = { __type: "ParamList", __items: listDiff12 };
  const paramListDiff21: DataDiff = { __type: "ParamList", __items: listDiff21 };

  const paramDict1: ParamDict = { __type: "ParamDict", ...dict1 };
  const paramDict2: ParamDict = { __type: "ParamDict", ...dict2 };
  const paramDictDiff12 = { __type: "ParamDict", ...dictDiff12 } as DataDiff;
  const paramDictDiff21 = { __type: "ParamDict", ...dictDiff21 } as DataDiff;

  const struct1 = { __type: "CustomStruct", ...dict1 } as unknown as Struct;
  const struct2 = { __type: "CustomStruct", ...dict2 } as unknown as Struct;
  const structDiff12 = { __type: "CustomStruct", ...dictDiff12 } as DataDiff;
  const structDiff21 = { __type: "CustomStruct", ...dictDiff21 } as DataDiff;

  const lastUpdated1: Datetime = {
    __type: "datetime.datetime",
    isoformat: "2023-01-02T00:00:00.000+00:00",
  };
  const lastUpdated2: Datetime = {
    __type: "datetime.datetime",
    isoformat: "2023-01-03T00:00:00.000+00:00",
  };
  const param1: Param = {
    __type: "CustomParam",
    __last_updated: lastUpdated1,
    ...dict1,
  };
  const param2: Param = {
    __type: "CustomParam",
    __last_updated: lastUpdated2,
    ...dict2,
  };
  const paramDiff12 = {
    __type: "CustomParam",
    __last_updated: lastUpdated2,
    ...dictDiff12,
  } as DataDiff;
  const paramDiff21 = {
    __type: "CustomParam",
    __last_updated: lastUpdated1,
    ...dictDiff21,
  } as DataDiff;

  // Struct and Param with a different types
  const otherStruct = { __type: "OtherStruct", ...dict1 } as unknown as Struct;
  const otherParam: Param = {
    __type: "OtherParam",
    __last_updated: lastUpdated1,
    ...dict1,
  };

  // Param with a later last updated time
  const updatedParam = { __type: "CustomParam", __last_updated: lastUpdated2, ...dict1 };
  const updatedParamDiff12 = { __type: "CustomParam", __last_updated: lastUpdated2 };
  const updatedParamDiff21 = { __type: "CustomParam", __last_updated: lastUpdated1 };

  // List containing groups
  const nestedList1 = [list1, paramList1, dict1, paramDict2, struct1, param1];
  const nestedList2 = [list1, paramList2, dict1, paramDict1, struct2, param1];
  const nestedListDiff12 = [
    undefined,
    paramListDiff12,
    undefined,
    paramDictDiff21,
    structDiff12,
    undefined,
  ];
  const nestedListDiff21 = [
    undefined,
    paramListDiff21,
    undefined,
    paramDictDiff12,
    structDiff21,
    undefined,
  ];

  // Dictionary containing groups
  const nestedDict1 = {
    list: list1,
    paramList: paramList1,
    dict: dict1,
    paramDict: paramDict2,
    struct: struct1,
    param: param1,
  };
  const nestedDict2 = {
    list: list1,
    paramList: paramList2,
    dict: dict1,
    paramDict: paramDict1,
    struct: struct2,
    param: param1,
  };
  const nestedDictDiff12 = {
    paramList: paramListDiff12,
    paramDict: paramDictDiff21,
    struct: structDiff12,
  };
  const nestedDictDiff21 = {
    paramList: paramListDiff21,
    paramDict: paramDictDiff12,
    struct: structDiff21,
  };

  type groupTestParams = {
    oldGroup: Group;
    newGroup: Group;
    dataDiff: DataDiff;
  };

  it.each`
    oldGroup        | newGroup        | dataDiff
    ${list1}        | ${list1}        | ${null}
    ${param1}       | ${param1}       | ${null}
    ${list1}        | ${dict1}        | ${{ __old: list1, __new: dict1 }}
    ${param1}       | ${dict1}        | ${{ __old: param1, __new: dict1 }}
    ${list1}        | ${list2}        | ${listDiff12}
    ${list2}        | ${list1}        | ${listDiff21}
    ${dict1}        | ${dict2}        | ${dictDiff12}
    ${dict2}        | ${dict1}        | ${dictDiff21}
    ${paramList1}   | ${paramList2}   | ${paramListDiff12}
    ${paramList2}   | ${paramList1}   | ${paramListDiff21}
    ${paramDict1}   | ${paramDict2}   | ${paramDictDiff12}
    ${paramDict2}   | ${paramDict1}   | ${paramDictDiff21}
    ${struct1}      | ${struct2}      | ${structDiff12}
    ${struct2}      | ${struct1}      | ${structDiff21}
    ${param1}       | ${param2}       | ${paramDiff12}
    ${param2}       | ${param1}       | ${paramDiff21}
    ${struct1}      | ${otherStruct}  | ${{ __old: struct1, __new: otherStruct }}
    ${otherStruct}  | ${struct1}      | ${{ __old: otherStruct, __new: struct1 }}
    ${param1}       | ${otherParam}   | ${{ __old: param1, __new: otherParam }}
    ${otherParam}   | ${param1}       | ${{ __old: otherParam, __new: param1 }}
    ${param1}       | ${updatedParam} | ${updatedParamDiff12}
    ${updatedParam} | ${param1}       | ${updatedParamDiff21}
    ${nestedList1}  | ${nestedList2}  | ${nestedListDiff12}
    ${nestedList2}  | ${nestedList1}  | ${nestedListDiff21}
    ${nestedDict1}  | ${nestedDict2}  | ${nestedDictDiff12}
    ${nestedDict2}  | ${nestedDict1}  | ${nestedDictDiff21}
  `(
    "computes the diff of $oldGroup and $newGroup",
    ({ oldGroup, newGroup, dataDiff }: groupTestParams) =>
      expect(getDataDiff(oldGroup, newGroup)).toEqual(dataDiff),
  );
});
*/

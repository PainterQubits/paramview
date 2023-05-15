import {
  Data,
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
import { formatDate } from "@/utils/timestamp";
import { leafToString, getTimestamp, getTypeString, getChildren } from "./data";

describe("leaf data", () => {
  const date = new Date();
  const timestamp = date.getTime();
  const datetimeString = formatDate(timestamp);
  const datetime: Datetime = {
    __type: "datetime.datetime",
    isoformat: date.toISOString(),
  };

  const quantity: Quantity = {
    __type: "astropy.units.quantity.Quantity",
    value: 1.2e9,
    unit: "m",
  };

  type leafTestParams = {
    leaf: Leaf;
    unrounded: string;
    rounded: string;
  };

  describe.each`
    leaf        | unrounded         | rounded
    ${123}      | ${"123"}          | ${"123"}
    ${-123}     | ${"-123"}         | ${"-123"}
    ${1.234}    | ${"1.234"}        | ${"1.234"}
    ${1.2345}   | ${"1.2345"}       | ${"1.234"}
    ${1.2355}   | ${"1.2355"}       | ${"1.236"}
    ${1234}     | ${"1234"}         | ${"1234"}
    ${12345}    | ${"12345"}        | ${"1.235e+4"}
    ${1.2e9}    | ${"1200000000"}   | ${"1.2e+9"}
    ${1.2e34}   | ${"1.2e+34"}      | ${"1.2e+34"}
    ${true}     | ${"True"}         | ${"True"}
    ${false}    | ${"False"}        | ${"False"}
    ${"test"}   | ${"test"}         | ${"test"}
    ${null}     | ${"None"}         | ${"None"}
    ${datetime} | ${datetimeString} | ${datetimeString}
    ${quantity} | ${"1200000000 m"} | ${"1.2e+9 m"}
  `("$leaf", ({ leaf, unrounded, rounded }: leafTestParams) => {
    it(`converts to "${unrounded}" unrounded`, () =>
      expect(leafToString(leaf, false)).toBe(unrounded));

    it(`converts to "${rounded}" rounded`, () =>
      expect(leafToString(leaf, true)).toBe(rounded));
  });
});

describe("group data", () => {
  const child1: Param = {
    __type: "Child",
    __last_updated: {
      __type: "datetime.datetime",
      isoformat: "2023-01-02T00:00:00.000Z",
    },
  };
  const child2: Param = {
    __type: "Child",
    __last_updated: {
      __type: "datetime.datetime",
      isoformat: "2023-01-04T00:00:00.000Z",
    },
  };
  const child3: Param = {
    __type: "Child",
    __last_updated: {
      __type: "datetime.datetime",
      isoformat: "2023-01-03T00:00:00.000Z",
    },
  };
  const list: List = [123, "test", child1, child2, child3];
  const dict: Dict = {
    number: 123,
    string: "test",
    child1,
    child2,
    child3,
  } as unknown as Dict;
  const paramList: ParamList = { __type: "ParamList", __items: list };
  const paramDict: ParamDict = { __type: "ParamDict", ...dict };
  const struct: Struct = { __type: "CustomStruct", ...dict } as unknown as Struct;
  const emptyStruct: Struct = { __type: "EmptyStruct" } as unknown as Struct;
  const param: Param = {
    __type: "CustomParam",
    __last_updated: {
      __type: "datetime.datetime",
      isoformat: "2023-01-01T00:00:00.000Z",
    },
    ...dict,
  };

  const lastUpdated = (param: Param) =>
    new Date(param.__last_updated.isoformat).getTime();
  const latestTimestamp = lastUpdated(child2);

  const listChildren = [
    ["0", 123],
    ["1", "test"],
    ["2", child1],
    ["3", child2],
    ["4", child3],
  ];
  const dictChildren = [
    ["number", 123],
    ["string", "test"],
    ["child1", child1],
    ["child2", child2],
    ["child3", child3],
  ];

  type groupTestParams = {
    group: Group;
    type: string;
    timestamp: number;
    children: [string, Data][];
  };

  describe.each`
    group          | type                       | timestamp              | children
    ${child1}      | ${"Child (Param)"}         | ${lastUpdated(child1)} | ${[]}
    ${child2}      | ${"Child (Param)"}         | ${lastUpdated(child2)} | ${[]}
    ${child3}      | ${"Child (Param)"}         | ${lastUpdated(child3)} | ${[]}
    ${list}        | ${"list"}                  | ${latestTimestamp}     | ${listChildren}
    ${dict}        | ${"dict"}                  | ${latestTimestamp}     | ${dictChildren}
    ${paramList}   | ${"ParamList"}             | ${latestTimestamp}     | ${listChildren}
    ${paramDict}   | ${"ParamDict"}             | ${latestTimestamp}     | ${dictChildren}
    ${struct}      | ${"CustomStruct (Struct)"} | ${latestTimestamp}     | ${dictChildren}
    ${emptyStruct} | ${"EmptyStruct (Struct)"}  | ${-Infinity}           | ${[]}
    ${param}       | ${"CustomParam (Param)"}   | ${lastUpdated(param)}  | ${dictChildren}
  `("$group", ({ group, type, timestamp, children }: groupTestParams) => {
    it(`gets type`, () => expect(getTypeString(group)).toBe(type));

    it(`gets timestamp`, () => {
      expect(timestamp).not.toBeNaN(); // Ensures "isoformat" strings above are valid
      expect(getTimestamp(group)).toBe(timestamp);
    });

    it(`gets children`, () => expect(getChildren(group)).toEqual(children));
  });
});

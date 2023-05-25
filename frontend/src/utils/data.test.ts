import {
  Path,
  LeafType,
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
import {
  leafToString,
  getLeafType,
  leafToInput,
  parseLeaf,
  getData,
  setData,
  getTypeString,
  getChildrenNames,
  getTimestamp,
} from "./data";

describe("leaf data", () => {
  const date = new Date();
  date.setMilliseconds(0); // Parsing does not handle milliseconds
  const timestamp = date.getTime();
  const datetimeString = formatDate(timestamp);
  const datetime: Datetime = {
    __type: "datetime.datetime",
    isoformat: date.toISOString().replace("Z", "+00:00"),
  };

  const makeQuantity = (value: number, unit: string): Quantity => ({
    __type: "astropy.units.quantity.Quantity",
    value,
    unit,
  });

  type leafTestParams = {
    leaf: Leaf;
    unrounded: string;
    rounded: string;
    leafType: LeafType;
    input: string;
    unitInput: string;
  };

  describe.each`
    leaf                              | unrounded          | rounded           | leafType             | input             | unitInput
    ${1.234}                          | ${"1.234"}         | ${"1.234"}        | ${LeafType.Number}   | ${"1.234"}        | ${""}
    ${1.2345}                         | ${"1.2345"}        | ${"1.234"}        | ${LeafType.Number}   | ${"1.2345"}       | ${""}
    ${1.2355}                         | ${"1.2355"}        | ${"1.236"}        | ${LeafType.Number}   | ${"1.2355"}       | ${""}
    ${-123}                           | ${"-123"}          | ${"-123"}         | ${LeafType.Number}   | ${"-123"}         | ${""}
    ${1234}                           | ${"1234"}          | ${"1234"}         | ${LeafType.Number}   | ${"1234"}         | ${""}
    ${12345}                          | ${"12345"}         | ${"1.235e+4"}     | ${LeafType.Number}   | ${"12345"}        | ${""}
    ${1.2e9}                          | ${"1200000000"}    | ${"1.2e+9"}       | ${LeafType.Number}   | ${"1200000000"}   | ${""}
    ${1200000001}                     | ${"1200000001"}    | ${"1.200e+9"}     | ${LeafType.Number}   | ${"1200000001"}   | ${""}
    ${1.2e34}                         | ${"1.2e+34"}       | ${"1.2e+34"}      | ${LeafType.Number}   | ${"1.2e+34"}      | ${""}
    ${true}                           | ${"True"}          | ${"True"}         | ${LeafType.Boolean}  | ${"True"}         | ${""}
    ${false}                          | ${"False"}         | ${"False"}        | ${LeafType.Boolean}  | ${"False"}        | ${""}
    ${"test"}                         | ${"test"}          | ${"test"}         | ${LeafType.String}   | ${"test"}         | ${""}
    ${null}                           | ${"None"}          | ${"None"}         | ${LeafType.Null}     | ${"None"}         | ${""}
    ${datetime}                       | ${datetimeString}  | ${datetimeString} | ${LeafType.Datetime} | ${datetimeString} | ${""}
    ${makeQuantity(1.234, "m")}       | ${"1.234 m"}       | ${"1.234 m"}      | ${LeafType.Quantity} | ${"1.234"}        | ${"m"}
    ${makeQuantity(1.2345, "s")}      | ${"1.2345 s"}      | ${"1.234 s"}      | ${LeafType.Quantity} | ${"1.2345"}       | ${"s"}
    ${makeQuantity(1.2355, "Hz")}     | ${"1.2355 Hz"}     | ${"1.236 Hz"}     | ${LeafType.Quantity} | ${"1.2355"}       | ${"Hz"}
    ${makeQuantity(-123, "m / s")}    | ${"-123 m / s"}    | ${"-123 m / s"}   | ${LeafType.Quantity} | ${"-123"}         | ${"m / s"}
    ${makeQuantity(1234, "km")}       | ${"1234 km"}       | ${"1234 km"}      | ${LeafType.Quantity} | ${"1234"}         | ${"km"}
    ${makeQuantity(12345, "mV")}      | ${"12345 mV"}      | ${"1.235e+4 mV"}  | ${LeafType.Quantity} | ${"12345"}        | ${"mV"}
    ${makeQuantity(1.2e9, "B")}       | ${"1200000000 B"}  | ${"1.2e+9 B"}     | ${LeafType.Quantity} | ${"1200000000"}   | ${"B"}
    ${makeQuantity(1200000001, "mA")} | ${"1200000001 mA"} | ${"1.200e+9 mA"}  | ${LeafType.Quantity} | ${"1200000001"}   | ${"mA"}
    ${makeQuantity(1.2e34, "K")}      | ${"1.2e+34 K"}     | ${"1.2e+34 K"}    | ${LeafType.Quantity} | ${"1.2e+34"}      | ${"K"}
  `(
    "$leaf",
    ({ leaf, unrounded, rounded, leafType, input, unitInput }: leafTestParams) => {
      it(`converts to "${unrounded}" unrounded`, () =>
        expect(leafToString(leaf, false)).toBe(unrounded));

      it(`converts to "${rounded}" rounded`, () =>
        expect(leafToString(leaf, true)).toBe(rounded));

      it(`gets leaf type ${LeafType[leafType]}`, () =>
        expect(getLeafType(leaf)).toBe(leafType));

      it(`converts to input "${input}" with unit "${unitInput}"`, () =>
        expect(leafToInput(leaf)).toEqual({ input, unitInput }));

      it(`parses from leaf type ${LeafType[leafType]}, input "${input}", and unit "${unitInput}"`, () =>
        expect(parseLeaf(leafType, input, unitInput)).toEqual(leaf));

      it("gets self for getData with empty path", () =>
        expect(getData(leaf, [])).toBe(leaf));
    },
  );
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
  const dict = {
    number: 123,
    string: "test",
    child1,
    child2,
    child3,
  } as unknown as Dict;
  const paramList: ParamList = { __type: "ParamList", __items: list };
  const paramDict: ParamDict = { __type: "ParamDict", ...dict };
  const struct = { __type: "CustomStruct", ...dict } as unknown as Struct;
  const emptyStruct = { __type: "EmptyStruct" } as unknown as Struct;
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

  const listChildrenNames = ["0", "1", "2", "3", "4"];

  const dictChildrenNames = ["number", "string", "child1", "child2", "child3"];

  type groupTestParams = {
    group: Group;
    path: Path;
    child: Data;
    typeString: string;
    childrenNames: string[];
    timestamp: number;
  };

  describe.each`
    group          | path          | child          | typeString                 | childrenNames        | timestamp
    ${child1}      | ${[]}         | ${child1}      | ${"Child (Param)"}         | ${[]}                | ${lastUpdated(child1)}
    ${child2}      | ${[]}         | ${child2}      | ${"Child (Param)"}         | ${[]}                | ${lastUpdated(child2)}
    ${child3}      | ${[]}         | ${child3}      | ${"Child (Param)"}         | ${[]}                | ${lastUpdated(child3)}
    ${list}        | ${["0"]}      | ${123}         | ${"list"}                  | ${listChildrenNames} | ${latestTimestamp}
    ${dict}        | ${["number"]} | ${123}         | ${"dict"}                  | ${dictChildrenNames} | ${latestTimestamp}
    ${paramList}   | ${["2"]}      | ${child1}      | ${"ParamList"}             | ${listChildrenNames} | ${latestTimestamp}
    ${paramDict}   | ${["child1"]} | ${child1}      | ${"ParamDict"}             | ${dictChildrenNames} | ${latestTimestamp}
    ${struct}      | ${["child1"]} | ${child1}      | ${"CustomStruct (Struct)"} | ${dictChildrenNames} | ${latestTimestamp}
    ${emptyStruct} | ${[]}         | ${emptyStruct} | ${"EmptyStruct (Struct)"}  | ${[]}                | ${-Infinity}
    ${param}       | ${["child1"]} | ${child1}      | ${"CustomParam (Param)"}   | ${dictChildrenNames} | ${lastUpdated(param)}
  `(
    "$group",
    ({ group, path, child, typeString, childrenNames, timestamp }: groupTestParams) => {
      it(`gets type string "${typeString}"`, () =>
        expect(getTypeString(group)).toBe(typeString));

      it("gets self for getData with empty path", () =>
        expect(getData(group, [])).toBe(group));

      if (path.length > 0) {
        it(`gets child data at path ${JSON.stringify(path)}`, () =>
          expect(getData(group, path)).toBe(child));

        it(`sets child data at path ${JSON.stringify(path)}`, () => {
          const groupCopy = JSON.parse(JSON.stringify(group));

          setData(groupCopy, path, "new value");
          expect(getData(groupCopy, path)).toBe("new value");
        });
      }

      it("gets children names", () =>
        expect(getChildrenNames(group)).toEqual(childrenNames));

      it(`gets timestamp ${timestamp}`, () => {
        expect(timestamp).not.toBeNaN(); // Ensures "isoformat" strings above are valid
        expect(getTimestamp(group)).toBe(timestamp);
      });
    },
  );
});

// Additional getData tests
describe("getData", () => {
  it("throws an error when getting child of a leaf", () =>
    expect(() => getData("test", ["child"])).toThrow(
      new TypeError(`data 'test' has no children (trying to get path ["child"])`),
    ));

  it("returns undefined if child does not exist", () =>
    expect(getData(["test"], ["child"])).toBe(undefined));

  it("gets deeply nested child", () => {
    const child = { value: "test" };
    const root = {
      child: [{ __type: "ParamList", __items: [child] }],
    } as unknown as Dict;

    expect(getData(root, ["child", "0", "0"])).toBe(child);
  });
});

// Additional getData tests
describe("setData", () => {
  it("throws an error when setting root data", () =>
    expect(() => setData("test", [], "new value")).toThrow(
      new RangeError("path is empty (setData cannot set the root data)"),
    ));

  it("throws an error when setting the child of a leaf", () =>
    expect(() => setData("test", ["child"], "new value")).toThrow(
      new TypeError(`data 'test' has no children (trying to set child "child")`),
    ));

  it("sets deeply nested child", () => {
    const root = {
      child: [{ __type: "ParamList", __items: [{ value: "test" }] }],
    } as unknown as Dict;

    setData(root, ["child", "0", "0"], "new child");
    expect(getData(root, ["child", "0", "0"])).toBe("new child");
  });
});

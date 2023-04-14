import { Data, Leaf, Group, Struct, Param, Datetime, Quantity } from "@/types";
import { formatDate } from "@/utils/timestamp";
import { leafToString, getTimestamp, getType, getChildren } from "@/utils/data";

const date = new Date();
const timestamp = date.getTime();
const datetimeString = formatDate(timestamp);
const datetime: Datetime = { __type: "datetime.datetime", isoformat: date.toISOString() };

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
  ${1.2e9}    | ${"1200000000"}   | ${"1.2e+9"}
  ${1.2e34}   | ${"1.2e+34"}      | ${"1.2e+34"}
  ${true}     | ${"True"}         | ${"True"}
  ${false}    | ${"False"}        | ${"False"}
  ${"test"}   | ${"test"}         | ${"test"}
  ${null}     | ${"None"}         | ${"None"}
  ${datetime} | ${datetimeString} | ${datetimeString}
  ${quantity} | ${"1200000000 m"} | ${"1.2e+9 m"}
`("leaf data $leaf", ({ leaf, unrounded, rounded }: leafTestParams) => {
  it(`converts to "${unrounded}" unrounded`, () =>
    expect(leafToString(leaf, false)).toBe(unrounded));

  it(`converts to "${rounded}" rounded`, () =>
    expect(leafToString(leaf, true)).toBe(rounded));
});

const param: Param = { __type: "CustomParam", __last_updated: datetime };
const struct: Struct = { __type: "CustomStruct", child: param } as unknown as Struct;

type groupTestParams = {
  group: Group;
  timestamp: number;
  type: string;
  children: [string, Data][];
};

describe.each`
  group     | timestamp    | type                       | children
  ${param}  | ${timestamp} | ${"CustomParam (Param)"}   | ${[]}
  ${struct} | ${timestamp} | ${"CustomStruct (Struct)"} | ${[["child", param]]}
`("group data $group", ({ group, timestamp, type, children }: groupTestParams) => {
  it(`gets timestamp ${timestamp}`, () => expect(getTimestamp(group)).toBe(timestamp));

  it(`gets type "${type}"`, () => expect(getType(group)).toBe(type));

  it(`gets children ${JSON.stringify(children)}`, () =>
    expect(getChildren(group)).toEqual(children));
});

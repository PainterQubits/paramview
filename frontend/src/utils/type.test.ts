import {
  Data,
  Datetime,
  Quantity,
  List,
  Dict,
  ParamList,
  ParamDict,
  Struct,
  Param,
} from "@/types";
import {
  isLeaf,
  isDatetime,
  isQuantity,
  isList,
  isDict,
  isParamList,
  isParamDict,
  isStruct,
  isParam,
} from "./type";

const allPredicates: ((data: Data) => boolean)[] = [
  isLeaf,
  isDatetime,
  isQuantity,
  isList,
  isDict,
  isParamList,
  isParamDict,
  isStruct,
  isParam,
];

const datetime: Datetime = {
  __type: "datetime.datetime",
  isoformat: new Date().toISOString(),
};
const quantity: Quantity = {
  __type: "astropy.units.quantity.Quantity",
  value: 1.2e9,
  unit: "m",
};
const list: List = [123, "test"];
const dict: Dict = { number: 123, string: "test" } as unknown as Dict;
const paramList: ParamList = { __type: "ParamList", __items: list };
const paramDict: ParamDict = { __type: "ParamDict", ...dict };
const struct: Struct = { __type: "CustomStruct", ...dict } as unknown as Struct;
const param: Param = { __type: "CustomParam", __last_updated: datetime, ...dict };

/**
 * An example value for each type of Data, and the predicates that should return true for
 * it.
 */
const dataValues: {
  [key: string]: { data: Data; predicates: ((data: Data) => boolean)[] };
} = {
  number: { data: 123, predicates: [isLeaf] },
  boolean: { data: true, predicates: [isLeaf] },
  string: { data: "test", predicates: [isLeaf] },
  null: { data: null, predicates: [isLeaf] },
  Datetime: { data: datetime, predicates: [isLeaf, isDatetime] },
  Quantity: { data: quantity, predicates: [isLeaf, isQuantity] },
  List: { data: list, predicates: [isList] },
  Dict: { data: dict, predicates: [isDict] },
  ParamList: { data: paramList, predicates: [isParamList] },
  ParamDict: { data: paramDict, predicates: [isParamDict] },
  Struct: { data: struct, predicates: [isStruct] },
  Param: { data: param, predicates: [isParam] },
};

// Test all combinations of predicate and Data types
describe.each(allPredicates)("%p", (predicate) => {
  describe.each(Object.entries(dataValues))("for %s", (_, { data, predicates }) => {
    const expected = predicates.includes(predicate);

    it(`is ${expected}`, () => expect(predicate(data)).toBe(expected));
  });
});

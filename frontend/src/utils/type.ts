import {
  Data,
  Leaf,
  Datetime,
  Quantity,
  List,
  Dict,
  ParamList,
  ParamDict,
  Param,
  Struct,
} from "@/types";

/** Whether the given Data's "__type" property is the given type. */
function checkType(data: Data, type: string) {
  return data instanceof Object && "__type" in data && data.__type === type;
}

/** Whether the given Data is a Datetime. */
export function isDatetime(data: Data): data is Datetime {
  return checkType(data, "datetime.datetime");
}

/** Whether the given Data is a Quantity. */
export function isQuantity(data: Data): data is Quantity {
  return checkType(data, "astropy.units.quantity.Quantity");
}

/** Whether the given Data is a Leaf. */
export function isLeaf(data: Data): data is Leaf {
  return !(data instanceof Object) || isDatetime(data) || isQuantity(data);
}

/** Whether the given Data is a List. */
export function isList(data: Data): data is List {
  return data instanceof Array;
}

/** Whether the given Data is a Dict. */
export function isDict(data: Data): data is Dict {
  return data instanceof Object && !("__type" in data);
}

/** Whether the given Data is a ParamList. */
export function isParamList(data: Data): data is ParamList {
  return checkType(data, "ParamList");
}

/** Whether the given Data is a ParamDict. */
export function isParamDict(data: Data): data is ParamDict {
  return checkType(data, "ParamDict");
}

/** Whether the given Data is a Param. */
export function isParam(data: Data): data is Param {
  return data instanceof Object && "__last_updated" in data;
}

/** Whether the given Data is a Struct. */
export function isStruct(data: Data): data is Struct {
  return (
    data instanceof Object &&
    "__type" in data &&
    !("__last_updated" in data) &&
    data.__type !== "datetime.datetime" &&
    data.__type !== "astropy.units.quantity.Quantity" &&
    data.__type !== "ParamList" &&
    data.__type !== "ParamDict"
  );
}

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
function checkType<T>(data: Data<T>, type: string) {
  return (
    typeof data === "object" && data !== null && "__type" in data && data.__type === type
  );
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
  return (
    typeof data !== "object" || data === null || isDatetime(data) || isQuantity(data)
  );
}

/** Whether the given Data is a List. */
export function isList<T>(data: Data<T>): data is List<T> {
  return data instanceof Array;
}

/** Whether the given Data is a Dict. */
export function isDict<T>(data: Data<T>): data is Dict<T> {
  return (
    typeof data === "object" && data !== null && !("__type" in data) && !isList(data)
  );
}

/** Whether the given Data is a ParamList. */
export function isParamList<T>(data: Data<T>): data is ParamList<T> {
  return checkType(data, "ParamList");
}

/** Whether the given Data is a ParamDict. */
export function isParamDict<T>(data: Data<T>): data is ParamDict<T> {
  return checkType(data, "ParamDict");
}

/** Whether the given Data is a Struct. */
export function isStruct<T>(data: Data<T>): data is Struct<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "__type" in data &&
    !("__last_updated" in data) &&
    data.__type !== "datetime.datetime" &&
    data.__type !== "astropy.units.quantity.Quantity" &&
    data.__type !== "ParamList" &&
    data.__type !== "ParamDict"
  );
}

/** Whether the given Data is a Param. */
export function isParam<T>(data: Data<T>): data is Param<T> {
  return typeof data === "object" && data !== null && "__last_updated" in data;
}

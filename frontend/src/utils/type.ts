import {
  Data,
  Leaf,
  List,
  Dict,
  Datetime,
  Quantity,
  Param,
  Struct,
  ParamList,
  ParamDict,
} from "@/types";

function checkType(data: Data, type: string) {
  return data instanceof Object && "__type" in data && data.__type === type;
}

export function isDatetime(data: Data): data is Datetime {
  return checkType(data, "datetime.datetime");
}

export function isQuantity(data: Data): data is Quantity {
  return checkType(data, "astropy.units.quantity.Quantity");
}

export function isLeaf(data: Data): data is Leaf {
  return !(data instanceof Object) || isDatetime(data) || isQuantity(data);
}

export function isList(data: Data): data is List {
  return data instanceof Array;
}

export function isDict(data: Data): data is Dict {
  return data instanceof Object && !("__type" in data);
}

export function isParam(data: Data): data is Param {
  return data instanceof Object && "__last_updated" in data;
}

export function isStruct(data: Data): data is Struct {
  return (
    data instanceof Object &&
    "type" in data &&
    !("__last_updated" in data) &&
    data.__type !== "ParamDict"
  );
}

export function isParamList(data: Data): data is ParamList {
  return checkType(data, "ParamList");
}

export function isParamDict(data: Data): data is ParamDict {
  return checkType(data, "ParamDict");
}

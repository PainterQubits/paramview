import { Leaf, Group, Data } from "@/types";
import { isQuantity, isList, isDict, isStruct, isParam, isParamList } from "@/utils/type";

export function leafToString(value: Leaf) {
  if (isQuantity(value)) return `${value.value} ${value.unit}`;

  if (typeof value === "boolean") return value ? "True" : "False";

  if (typeof value === "string") return `"${value}"`;

  if (value === null) return "None";

  return `${value}`;
}

export function getType(group: Group) {
  if (isList(group)) return "list";
  if (isDict(group)) return "dict";
  return group.__type;
}

export function getChildren(group: Group): [string, Data][] {
  let children: Data[] | { [key: string]: Data };
  if (isList(group) || isDict(group)) {
    children = group;
  } else if (isStruct(group)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, __struct, ...rest } = group;
    children = rest;
  } else if (isParam(group)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, __last_updated, ...rest } = group;
    children = rest;
  } else if (isParamList(group)) {
    children = group.__items;
  } else {
    // ParamDict
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, ...rest } = group;
    children = rest;
  }
  return Object.entries(children);
}

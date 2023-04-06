import { Leaf, Group, Data } from "@/types";
import {
  isLeaf,
  isDatetime,
  isQuantity,
  isList,
  isDict,
  isStruct,
  isParam,
  isParamList,
} from "@/utils/type";
import { formatDate } from "@/utils/timestamp";

export function leafToString(value: Leaf) {
  if (isDatetime(value)) return formatDate(value.isoformat);

  if (isQuantity(value)) return `${value.value} ${value.unit}`;

  if (typeof value === "boolean") return value ? "True" : "False";

  if (typeof value === "string") return `"${value}"`;

  if (value === null) return "None";

  return `${value}`;
}

export function getType(group: Group) {
  if (isList(group)) return "list";

  if (isDict(group)) return "dict";

  if (isParam(group)) return `${group.__type} (Param)`;

  if (isStruct(group)) return `${group.__type} (Struct)`;

  return group.__type;
}

export function getTimestamp(group: Group): number {
  if (isParam(group)) return new Date(group.__last_updated.isoformat).getTime();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timestamps = getChildren(group).map(([_, data]) =>
    isLeaf(data) ? -Infinity : getTimestamp(data),
  );
  return Math.max(...timestamps);
}

export function getChildren(group: Group): [string, Data][] {
  let children: Data[] | { [key: string]: Data };
  if (isList(group) || isDict(group)) {
    children = group;
  } else if (isParam(group)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, __last_updated, ...rest } = group;
    children = rest;
  } else if (isParamList(group)) {
    children = group.__items;
  } else {
    // Struct, ParamDict, or unknown type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, ...rest } = group;
    children = rest;
  }
  return Object.entries(children);
}

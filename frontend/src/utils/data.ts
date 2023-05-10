import { Path, Leaf, Group, Data } from "@/types";
import {
  isLeaf,
  isDatetime,
  isQuantity,
  isList,
  isDict,
  isParamList,
  isParam,
  isStruct,
} from "@/utils/type";
import { formatDate } from "@/utils/timestamp";

const precision = 4;

/** Convert the given number to a string, rounding it if round is true. */
function numberToString(num: number, round: boolean) {
  const numString = String(num);

  if (round) {
    const exponential = num.toExponential();
    const exponent = Number(exponential.split("e")[1]);

    if (Math.abs(exponent) >= precision) {
      const exponentialToPrecision = num.toExponential(precision - 1);
      return exponentialToPrecision.length < exponential.length
        ? exponentialToPrecision
        : exponential;
    }

    const numToPrecision = num.toPrecision(precision);
    return numToPrecision.length < numString.length ? numToPrecision : numString;
  }

  return numString;
}

/**
 * Convert the given Leaf to a string, rounding it if it is a number and round is true.
 */
export function leafToString(value: Leaf, round: boolean) {
  if (isDatetime(value)) return formatDate(value.isoformat);

  if (isQuantity(value)) return `${numberToString(value.value, round)} ${value.unit}`;

  if (typeof value === "boolean") return value ? "True" : "False";

  if (value === null) return "None";

  if (typeof value === "number") return numberToString(value, round);

  return value;
}

/** Return a string representing the type of the given Group. */
export function getType(group: Group) {
  if (isList(group)) return "list";

  if (isDict(group)) return "dict";

  if (isParam(group)) return `${group.__type} (Param)`;

  if (isStruct(group)) return `${group.__type} (Struct)`;

  return group.__type;
}

/** Get the last updated timestamp from the given Group. */
export function getTimestamp(group: Group): number {
  if (isParam(group)) return new Date(group.__last_updated.isoformat).getTime();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timestamps = getChildren(group).map(([_, data]) =>
    isLeaf(data) ? -Infinity : getTimestamp(data),
  );

  return Math.max(...timestamps);
}

/** Return data at the given path within the given data. */
export function getData(data: Data, path: Path): Data {
  if (path.length === 0) return data;

  if (isLeaf(data)) {
    throw new Error(`cannot get child from data '${data}' with path ${path}`);
  }

  const [key, ...remainingPath] = path;

  if (isParamList(data)) return getData(data.__items[Number(key)], remainingPath);

  if (isList(data)) return getData(data[Number(key)], remainingPath);

  // Dict, ParamDict, Struct, or Param
  return getData(data[key], remainingPath);
}

/** Get the names of the child data within the given group. */
export function getChildrenNames(group: Group) {
  let children: Data[] | { [key: string]: Data };

  if (isList(group) || isDict(group)) {
    children = group;
  } else if (isParamList(group)) {
    children = group.__items;
  } else if (isParam(group)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, __last_updated, ...rest } = group;
    children = rest;
  } else {
    // ParamDict or Struct
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, ...rest } = group;
    children = rest;
  }

  return Object.keys(children);
}

/** Return the Data values contained with the given Group. */
export function getChildren(group: Group): [string, Data][] {
  let children: Data[] | { [key: string]: Data };

  if (isList(group) || isDict(group)) {
    children = group;
  } else if (isParamList(group)) {
    children = group.__items;
  } else if (isParam(group)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, __last_updated, ...rest } = group;
    children = rest;
  } else {
    // Struct, ParamDict, or unknown type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __type, ...rest } = group;
    children = rest;
  }

  return Object.entries(children);
}

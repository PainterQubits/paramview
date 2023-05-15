import { Path, LeafType, Data, Leaf, Group } from "@/types";
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
export function leafToString(leaf: Leaf, round: boolean) {
  if (isDatetime(leaf)) return formatDate(leaf.isoformat);

  if (isQuantity(leaf)) return `${numberToString(leaf.value, round)} ${leaf.unit}`;

  if (typeof leaf === "boolean") return leaf ? "True" : "False";

  if (leaf === null) return "None";

  if (typeof leaf === "number") return numberToString(leaf, round);

  return leaf;
}

function parseNumber(input: string) {
  const numberInput = Number(input);

  if (!Number.isNaN(Number.parseFloat(input)) && Number.isFinite(numberInput)) {
    return numberInput;
  }
}

export function leafToInput(leaf: Leaf) {
  if (isQuantity(leaf)) {
    return [String(leaf.value), leaf.unit];
  }

  return [leafToString(leaf, false), ""];
}

export function parseLeaf(
  input: string,
  unit: string,
  leafType: LeafType,
): Leaf | undefined {
  if (leafType === LeafType.String) {
    return input;
  }

  if (leafType === LeafType.Number) {
    return parseNumber(input);
  }

  if (leafType === LeafType.Quantity) {
    const number = parseNumber(input);

    if (number !== undefined && unit !== "") {
      return {
        __type: "astropy.units.quantity.Quantity",
        value: number,
        unit,
      };
    }
  }

  if (leafType === LeafType.Datetime) {
    const dateInput = new Date(input);

    if (!Number.isNaN(dateInput.getTime())) {
      // Z is replaced for compatibility with Python parsing
      return new Date(input).toISOString().replace("Z", "+00:00");
    }
  }

  const lowerCaseInput = input.toLowerCase();

  if (leafType === LeafType.Boolean) {
    if (lowerCaseInput === "true") return true;
    if (lowerCaseInput === "false") return false;
  }

  if (leafType === LeafType.Null) {
    if (lowerCaseInput === "none") return null;
  }
}

/** Return a string representing the type of the given Group. */
export function getTypeString(group: Group) {
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
    throw new Error(`cannot get child of data '${data}' with path '${path}'`);
  }

  const [key, ...remainingPath] = path;

  if (isParamList(data)) return getData(data.__items[Number(key)], remainingPath);

  if (isList(data)) return getData(data[Number(key)], remainingPath);

  // Dict, ParamDict, Struct, or Param
  return getData(data[key], remainingPath);
}

/**
 * Set the data at the given path to the given value. Note that this mutates the data
 * object that is passed in.
 */
export function setData(data: Data, path: Path, value: Data) {
  if (path.length === 0) {
    throw new Error("cannot set data with no path");
  }

  const parentData = getData(data, path.slice(0, -1));
  const key = path[path.length - 1];

  if (isLeaf(parentData)) {
    throw new Error(`cannot set child of data '${parentData}' with key '${key}'`);
  }

  if (isParamList(parentData)) {
    parentData.__items[Number(key)] = value;
  } else if (isList(parentData)) {
    parentData[Number(key)] = value;
  } else {
    // Dict, ParamDict, Struct, or Param
    parentData[key] = value;
  }
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

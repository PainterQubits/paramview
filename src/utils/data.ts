/* eslint-disable @typescript-eslint/no-unused-vars */

import { Path, LeafType, DataDict, Data, Leaf, Group } from "@/types";
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
import { formatDate, getISOString, getLocalISOString } from "@/utils/timestamp";

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

/** Get the type (as a LeafType enum value) of the given leaf. */
export function getLeafType(leaf: Leaf) {
  switch (typeof leaf) {
    case "number":
      return LeafType.Number;
    case "boolean":
      return LeafType.Boolean;
    case "string":
      return LeafType.String;
  }

  if (leaf === null) return LeafType.Null;

  if (isDatetime(leaf)) return LeafType.Datetime;

  return LeafType.Quantity;
}

/** Convert the given leaf to an input string and a unit input string. */
export function leafToInput(leaf: Leaf) {
  if (isDatetime(leaf)) {
    return { input: getLocalISOString(leaf.isoformat), unitInput: "" };
  }

  if (isQuantity(leaf)) {
    return { input: String(leaf.value), unitInput: leaf.unit };
  }

  return { input: leafToString(leaf, false), unitInput: "" };
}

/**
 * Return a number for the given input string, or undefined if the input is not a valid
 * number.
 */
function parseNumber(input: string) {
  const numberInput = Number(input);

  if (!Number.isNaN(Number.parseFloat(input)) && Number.isFinite(numberInput)) {
    return numberInput;
  }
}

/**
 * Return a leaf for the given leaf type, input, and unit input, or undefined if
 * the input is not valid for the given leaf type.
 */
export function parseLeaf(
  leafType: LeafType,
  input: string,
  unitInput: string,
): Leaf | undefined {
  if (leafType === LeafType.String) {
    return input;
  }

  if (leafType === LeafType.Number) {
    return parseNumber(input);
  }

  if (leafType === LeafType.Quantity) {
    const number = parseNumber(input);

    if (number !== undefined && unitInput !== "") {
      return {
        __type: "astropy.units.quantity.Quantity",
        value: number,
        unit: unitInput,
      };
    }
  }

  if (leafType === LeafType.Datetime) {
    const dateInput = new Date(input);

    if (!Number.isNaN(dateInput.getTime())) {
      return { __type: "datetime.datetime", isoformat: getISOString(input) };
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

/** Return data at the given path within the given data. */
export function getData(data: Data, path: Path): Data {
  if (path.length === 0) return data;

  if (isLeaf(data)) {
    throw new TypeError(
      `data '${leafToString(data, false)}' has no children` +
        ` (trying to get path ${JSON.stringify(path)})`,
    );
  }

  const [key, ...remainingPath] = path;

  if (isParamList(data)) return getData(data.__items[Number(key)], remainingPath);

  if (isList(data)) return getData(data[Number(key)], remainingPath);

  // Dict, ParamDict, Struct, or Param
  return getData(data[key], remainingPath);
}

/**
 * Set the data at the given path to the given value. Note that this mutates the data
 * object that is passed in. The path must not be empty (the root data must be reassigned
 * separately).
 */
export function setData(data: Data, path: Path, value: Data) {
  if (path.length === 0) {
    throw new RangeError("path is empty (setData cannot set the root data)");
  }

  const parentData = getData(data, path.slice(0, -1));
  const key = path[path.length - 1];

  if (isLeaf(parentData)) {
    throw new TypeError(
      `data '${leafToString(parentData, false)}' has no children` +
        ` (trying to set child "${key}")`,
    );
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

/** Return a string representing the type of the given Group. */
export function getTypeString<T>(group: Group<T>) {
  if (isList(group)) return "list";

  if (isDict(group)) return "dict";

  if (isParam(group)) return `${group.__type} (Param)`;

  if (isStruct(group)) return `${group.__type} (Struct)`;

  return group.__type;
}

/** Get the names of the child data within the given group. */
export function getChildrenNames<T>(group: Group<T>) {
  let children: Data<T>[] | DataDict<T>;

  if (isList(group) || isDict(group)) {
    children = group;
  } else if (isParamList(group)) {
    children = group.__items;
  } else if (isParam(group)) {
    const { __type, __last_updated, ...rest } = group;
    children = rest;
  } else {
    // ParamDict or Struct
    const { __type, ...rest } = group;
    children = rest;
  }

  return Object.keys(children);
}

/**
 * Get the last updated timestamp from the given Group or GroupDiff, or -Infinity if
 * there is no timestamp.
 */
export function getTimestamp<T>(group: Group<T>): number {
  if (isParam(group)) return new Date(group.__last_updated.isoformat).getTime();

  const timestamps = getChildrenNames(group).map((childName) => {
    // Don't bubble up timestamps from old data in a GroupDiff
    if (childName === "__old") {
      return -Infinity;
    }

    // Officially, getData only works on normal Data objects. However, we know it will
    // work on DataDiff objects in this context, so we cast group to the Data type.
    // Similarly, the resulting childData is technically of type Data<T>, but we know that
    // for this particular use case it will get the correc timestamp.
    const childData = getData(group as Data, [childName]);
    return isLeaf(childData) ? -Infinity : getTimestamp(childData);
  });

  return Math.max(...timestamps);
}

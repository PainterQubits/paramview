import { Path, LeafType, DataType, Data, AllowedLeafType, Leaf, Group } from "@/types";
import { formatDate, getLocalISOString } from "@/utils/timestamp";

const PRECISION = 4;

/** Convert the given number to a string, rounding it if round is true. */
function numberToString(num: number, round: boolean) {
  const numString = String(num);

  if (round) {
    const exponential = num.toExponential();
    const exponent = Number(exponential.split("e")[1]);

    if (Math.abs(exponent) >= PRECISION) {
      const exponentialToPrecision = num.toExponential(PRECISION - 1);
      return exponentialToPrecision.length < exponential.length
        ? exponentialToPrecision
        : exponential;
    }

    const numToPrecision = num.toPrecision(PRECISION);
    return numToPrecision.length < numString.length ? numToPrecision : numString;
  }

  return numString;
}

/**
 * Convert the given leaf value to a string, rounding it if it is a number and `round`
 * is true.
 */
export function leafToString(leaf: Leaf, round: boolean) {
  switch (typeof leaf) {
    case "number":
      return numberToString(leaf, round);
    case "boolean":
      return leaf ? "True" : "False";
    case "string":
      return leaf;
  }

  if (leaf === null) {
    return "None";
  }

  if (leaf.type === DataType.Datetime) {
    return formatDate(leaf.timestamp);
  }

  // leaf is Quantity
  return `${numberToString(leaf.value, round)} ${leaf.unit}`;
}

/** Get the type (as a `LeafType` enum value) of the given leaf. */
export function getLeafType(leaf: Leaf) {
  switch (typeof leaf) {
    case "number":
      return LeafType.Number;
    case "boolean":
      return LeafType.Boolean;
    case "string":
      return LeafType.String;
  }

  if (leaf === null) {
    return LeafType.Null;
  }

  if (leaf.type === DataType.Datetime) {
    return LeafType.Datetime;
  }

  // leaf is Quantity
  return LeafType.Quantity;
}

/** Convert the given leaf to an input string and a unit input string. */
export function leafToInput(leaf: Leaf) {
  if (typeof leaf === "object" && leaf !== null) {
    switch (leaf.type) {
      case DataType.Datetime:
        return { input: getLocalISOString(leaf.timestamp), unitInput: "" };
      case DataType.Quantity:
        return { input: String(leaf.value), unitInput: leaf.unit };
    }
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
      return { type: DataType.Quantity, value: number, unit: unitInput };
    }
  }

  if (leafType === LeafType.Datetime) {
    const dateInput = new Date(input);
    const timestamp = dateInput.getTime();

    if (!Number.isNaN(timestamp)) {
      return { type: DataType.Datetime, timestamp: timestamp / 1000 };
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

/** Check whether the given `Data` is a `Leaf`. */
export function isLeaf(data: Data<AllowedLeafType>): data is Leaf {
  return (
    typeof data !== "object" ||
    data === null ||
    data.type === DataType.Datetime ||
    data.type === DataType.Quantity
  );
}

/**
 * If the given `Data` is `ParamData`, then return the class name (or `null`), and the
 * last updated timestamp as a string, and the underlying `Data` value. Otherwise, just
 * return the original `Data`.
 */
export function unwrapParamData<LeafType extends AllowedLeafType>(data: Data<LeafType>) {
  let className: string | undefined;
  let lastUpdated: number | null = null;
  let innerData = data;

  while (
    typeof innerData === "object" &&
    innerData !== null &&
    innerData.type === DataType.ParamData
  ) {
    ({ className, lastUpdated, data: innerData } = innerData);
  }

  return {
    className: className ?? null,
    lastUpdated: lastUpdated !== null ? formatDate(lastUpdated) : null,
    // We cast because innerData can no longer be ParamData due to the while loop
    innerData: innerData as LeafType | Group<LeafType>,
  };
}

export function getChildren<LeafType extends AllowedLeafType>(group: Group<LeafType>) {
  return group.data as { [key: string]: Data<LeafType> };
}

/** Return the data at the given path within the given data. */
export function getData<LeafType extends AllowedLeafType>(
  data: Data<LeafType>,
  path: Path,
) {
  if (path.length === 0) return data;

  const { innerData } = unwrapParamData(data);

  if (isLeaf(innerData) || innerData.type === DataType.Diff) {
    throw new TypeError(
      `data '${JSON.stringify(data)}' has no children` +
        ` (trying to get path ${JSON.stringify(path)})`,
    );
  }

  const [key, ...remainingPath] = path;

  return getData(getChildren(innerData)[key], remainingPath);
}

/**
 * Set the data at the given path to the given value. Note that this mutates the data
 * object that is passed in. The path must not be empty (the root data must be reassigned
 * separately).
 *
 * If the value is `undefined`, the data will be deleted instead.
 */
export function setData<LeafType extends AllowedLeafType>(
  data: Data<LeafType>,
  path: Path,
  action:
    | { type: "set"; value: Data<LeafType>; withinParamData?: boolean }
    | { type: "delete" },
) {
  if (path.length === 0) {
    throw new RangeError(`path is empty (setData cannot ${action.type} the root data)`);
  }

  const parentData = getData(data, path.slice(0, -1));
  const { innerData: parentInnerData } = unwrapParamData(parentData);
  const key = path[path.length - 1];

  if (isLeaf(parentInnerData) || parentInnerData.type === DataType.Diff) {
    throw new TypeError(
      `data '${JSON.stringify(parentData)}' has no children` +
        ` (trying to set child "${key}")`,
    );
  }

  const parentChildren = getChildren(parentInnerData);

  if (action.type === "delete") {
    delete parentChildren[key];
  } else {
    const { value, withinParamData = false } = action;
    const childData = parentChildren[key];

    if (
      withinParamData &&
      typeof childData === "object" &&
      childData !== null &&
      childData.type === DataType.ParamData
    ) {
      childData.data = value;
    } else {
      parentChildren[key] = value;
    }
  }
}

/**
 * Update the last updated time for the given path within the given root `Data` object.
 */
export function updateLastUpdated(rootData: Data, path: Path) {
  console.log(`Updating timestamp for ${JSON.stringify(path)}`);

  // // Update the last updated time of the leaf's parent if it is a Param and any of
  // // its children have changed. Otherwise, reset the Param's last updated timestamp,
  // // since none of its values have changed.
  // if (editedParentParam !== null) {
  //   const childrenChanged =
  //     originalParentParam === null ||
  //     getChildrenNames(editedParentParam).some(
  //       (childName) =>
  //         editedParentParam[childName] !== originalParentParam[childName],
  //     );

  //   editedParentParam.__last_updated.isoformat = childrenChanged
  //     ? getISOString(Date.now())
  //     : originalParentParam.__last_updated.isoformat;
  // }
}

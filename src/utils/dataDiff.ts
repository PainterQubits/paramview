import deepEquals from "fast-deep-equal";
import { DataType, Data, Group, ParamData, Diff } from "@/types";
import { isLeaf, unwrapParamData, getData, setData } from "@/utils/data";

/**
 * Return the difference between the two given `Data` objects.
 *
 * If the two `Data` objects have children and the same `DataType`, then this function
 * will return a `Group` object with the same `DataType` containing differences for each
 * child that has changed.
 *
 * Otherwise, it will return a `Diff` object if the old and new `Data` objects are
 * different, or `null` if they are equal.
 *
 * This function also modifies the last updated timestamps of `ParamData` items in the new
 * `Data` to be the latest last updated time of their children.
 */
export function getDataDiff(oldData: Data, newData: Data): Data<Diff> | null {
  const { className: oldClassName, innerData: oldInnerData } = unwrapParamData(oldData);
  const { className: newClassName, innerData: newInnerData } = unwrapParamData(newData);

  if (deepEquals(oldData, newData)) {
    return null;
  }

  // If either Data object has no children or has a different DataType, then return a Diff
  // comparison object.
  if (isLeaf(oldInnerData) || isLeaf(newInnerData) || oldClassName !== newClassName) {
    return { type: DataType.Diff, old: oldData, new: newData };
  }

  // Otherwise, return a Group object containing Diffs for its children. Children that
  // have not been changed are set to undefined.

  // Start with deep copy of the new Data. It is important to use the new Data so that the
  // latest non-child properties are shown, such as the last updated time for Params.
  const dataDiff: Group<Diff> | ParamData<Diff> = JSON.parse(JSON.stringify(newData));

  // Compare each child of the old Data to the corresponding child in the new Data. If
  // they are the same, delete from groupDiff. Otherwise, set that child to the
  // difference.
  Object.entries(oldInnerData.data).forEach(([oldChildName, oldChildData]) => {
    const newChildData = getData(newData, [oldChildName]);
    const childDataDiff = getDataDiff(oldChildData, newChildData);

    setData(
      dataDiff,
      [oldChildName],
      childDataDiff === null ? { type: "delete" } : { type: "set", value: childDataDiff },
    );
  });

  // Perform the same operation in reverse (for children that have been added in the
  // new data).
  Object.entries(newInnerData.data).forEach(([newChildName, newChildData]) => {
    const oldChildData = getData(oldData, [newChildName]);
    const childDataDiff = getDataDiff(oldChildData, newChildData);

    setData(
      dataDiff,
      [newChildName],
      dataDiff === null ? { type: "delete" } : { type: "set", value: childDataDiff },
    );
  });

  // Update timestamps for the new `Data` and for the `Data<Diff>`
  if (
    typeof newData === "object" &&
    newData !== null &&
    newData.type === DataType.ParamData
  ) {
    const latestLastUpdated = Math.max(
      ...Object.values(newInnerData.data).map((newChildData) =>
        typeof newChildData === "object" &&
        newChildData !== null &&
        newChildData.type === DataType.ParamData
          ? newChildData.lastUpdated
          : -Infinity,
      ),
    );

    if (isFinite(latestLastUpdated)) {
      newData.lastUpdated = latestLastUpdated;
      (dataDiff as ParamData).lastUpdated = latestLastUpdated;
    }
  }

  return dataDiff;
}

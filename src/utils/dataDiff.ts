import deepEquals from "fast-deep-equal";
import { DataDiff, GroupDiff, Data } from "@/types";
import { isLeaf } from "@/utils/type";
import { getData, setData, getTypeString, getChildrenNames } from "@/utils/data";

/**
 * Return the difference between the two given `Data` objects.
 *
 * If the two`Data` objects are `Group`s of the same type, then this function will return
 * a `Group` containing differences for each child that has changed. Otherwise, it will
 * return a `DataChange` object if the old and new `Data` are different, or `null` if they
 * are the equal.
 */
export function getDataDiff(oldData: Data, newData: Data): DataDiff | null {
  // If the Data objects are equal, return null.
  if (deepEquals(oldData, newData)) {
    return null;
  }

  // If either Data object is a leaf or if they are Groups of different types, just return
  // a DataChange comparison.
  if (
    isLeaf(oldData) ||
    isLeaf(newData) ||
    getTypeString(oldData) !== getTypeString(newData)
  ) {
    return { __old: oldData, __new: newData };
  }

  // Otherwise, return a Group object containing DataDiffs for its children. Children that
  // have not been changed are not included.

  // Start with copy of new Data. It is important to use the new Data so that non-child
  // properties, such as the last updated time for Params, are shown.
  const groupDiff: GroupDiff = JSON.parse(JSON.stringify(newData));

  // Compare each child of old Data to the corresponding child in new Data. If they are
  // the same, delete from groupDiff. Otherwise, set that child to the difference.
  getChildrenNames(oldData).forEach((oldChildName) => {
    const oldChildData = getData(oldData, [oldChildName]);
    const newChildData = getData(newData, [oldChildName]);

    const dataDiff = getDataDiff(oldChildData, newChildData);

    // Officially, setData only works on normal Data objects. However, we know it will
    // work to set DataDiff objects here, so we cast them to the Data type. Setting to
    // values to undefined is meant to represent deleting them.
    setData(
      groupDiff as Data,
      [oldChildName],
      (dataDiff === null ? undefined : dataDiff) as Data,
    );
  });

  // Compare each child of new Data to the corresponding child in old Data, and set that
  // child in groupDiff to the difference. (All unchanged children have already been
  // deleted above.)
  getChildrenNames(newData).forEach((newChildName) => {
    const oldChildData = getData(oldData, [newChildName]);
    const newChildData = getData(newData, [newChildName]);

    const dataDiff = getDataDiff(oldChildData, newChildData);

    if (dataDiff !== null) {
      // Officially, setData only works on normal Data objects. However, we know it will
      // work to set DataDiff objects here, so we cast them to the Data type.
      setData(groupDiff as Data, [newChildName], dataDiff as Data);
    }
  });
  return groupDiff;
}

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

  // Start with copy of old Data
  const groupDiff: GroupDiff = JSON.parse(JSON.stringify(oldData));

  // Compare each child of old Data to the corresponding child in new Data. If they are
  // the same, delete from groupDiff. Otherwise, set that child to the difference.
  getChildrenNames(oldData).forEach((oldChildName) => {
    const oldChildData = getData(oldData, [oldChildName]);
    const newChildData = getData(newData, [oldChildName]);

    const dataDiff = getDataDiff(oldChildData, newChildData);

    if (dataDiff === null) {
      // Groups can be arrays, which technically have number keys. However, it also works
      // to treat array keys like strings in JavaScript, and to delete keys in the middle
      // of arrays (those items become "empty slots").
      delete (groupDiff as { [key: string]: unknown })[oldChildName];
    } else {
      // Officially, setData only works on normal Data objects. However, we know it will
      // work to set DataDiff objects here, so we cast them to the Data type.
      setData(groupDiff as Data, [oldChildName], dataDiff as Data);
    }
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

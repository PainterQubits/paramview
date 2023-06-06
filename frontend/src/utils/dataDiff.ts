import deepEquals from "fast-deep-equal";
import { Data, Leaf, Group } from "@/types";
import { isLeaf } from "@/utils/type";
import { getData, setData, getTypeString, getChildrenNames } from "@/utils/data";

type GroupDiff = Group<Leaf | DataChange>;

type DataChange = { __old: Data; __new: Data };

export function getDataDiff(oldData: Data, newData: Data): GroupDiff | DataChange | null {
  if (deepEquals(oldData, newData)) {
    return null;
  }

  if (
    isLeaf(oldData) ||
    isLeaf(newData) ||
    getTypeString(oldData) !== getTypeString(newData)
  ) {
    return { __old: oldData, __new: newData };
  }

  const groupDiff: GroupDiff = JSON.parse(JSON.stringify(oldData));

  getChildrenNames(oldData).forEach((oldChildName) => {
    const oldChildData = getData(oldData, [oldChildName]);
    const newChildData = getData(newData, [oldChildName]);

    const dataDiff = getDataDiff(oldChildData, newChildData);

    if (dataDiff === null) {
      delete (groupDiff as { [key: string]: unknown })[oldChildName];
    } else {
      setData(groupDiff as Data, [oldChildName], dataDiff as Data);
    }
  });

  getChildrenNames(newData).forEach((newChildName) => {
    const oldChildData = getData(oldData, [newChildName]);
    const newChildData = getData(newData, [newChildName]);

    const dataDiff = getDataDiff(oldChildData, newChildData);

    if (dataDiff !== null) {
      setData(groupDiff as Data, [newChildName], dataDiff as Data);
    }
  });

  return groupDiff;
}

/** Entry in the commit history. */
export type CommitEntry = {
  id: number;
  message: string;
  timestamp: string;
};

/** Path to data from the root. */
export type Path = string[];

/** Enum of leaf types. */
export enum LeafType {
  Number,
  Boolean,
  String,
  Null,
  Datetime,
  Quantity,
}

/**
 * Type strings corresponding to different object types in the JSON representation of a
 * ParamDB commit, as specified by [paramdb.ParamDBType](https://paramdb.readthedocs.io/en/stable/api-reference.html#paramdb.ParamDBType).
 */
export enum DataType {
  Datetime = "datetime",
  Quantity = "Quantity",
  List = "list",
  Dict = "dict",
  ParamData = "ParamData",
  Diff = "Diff",
}

/**
 * JSON data loaded from a ParamDB commit, as specified by
 * [paramdb.ParamDB.load()](https://paramdb.readthedocs.io/en/stable/api-reference.html#paramdb.ParamDB.load).
 */
export type Data<LeafType extends AllowedLeafType = Leaf> =
  | LeafType
  | Group<LeafType>
  | ParamData<LeafType>;

export type AllowedLeafType = Leaf | Diff;

/** `Data` value that does not contain other values. */
export type Leaf = number | boolean | string | null | Datetime | Quantity;

/** `Data` value that contains other values. */
export type Group<LeafType extends AllowedLeafType = Leaf> =
  | List<LeafType>
  | Dict<LeafType>;

/** Datetime object representation. */
export type Datetime = { type: DataType.Datetime; timestamp: number };

/** Astropy Quantity object representation. */
export type Quantity = { type: DataType.Quantity; value: number; unit: string };

/** List object representation. */
export type List<LeafType extends AllowedLeafType = Leaf> = {
  type: DataType.List;
  data: Data<LeafType>[];
};

/** Dictionary object representation. */
export type Dict<LeafType extends AllowedLeafType = Leaf> = {
  type: DataType.Dict;
  data: { [key: string]: Data<LeafType> };
};

/** Parameter data object representation. */
export type ParamData<LeafType extends AllowedLeafType = Leaf> = {
  type: DataType.ParamData;
  className?: string;
  lastUpdated: number;
  data: Data<LeafType>;
};

/**
 * Changed piece of `Data`, containing the old and new values.
 *
 * If `old` is undefined, the data is new. If `new` is undefined, the data was deleted. If
 * neither is undefined, the data has been updated.
 */
export type Diff = {
  type: DataType.Diff;
  old?: Data;
  new?: Data;
};

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
 * Difference between two Data objects.
 *
 * Either a DataChange object, a Group containing further DataDiff objects.
 */
export type DataDiff = DataChange | GroupDiff;

/** Difference between two Group objects. */
export type GroupDiff = Group<DataChange>;

/**
 * Changed piece of Data, containing the old and new values.
 *
 * If __old is undefined, the data is new. If __new is undefined, the data was deleted. If
 * neither is undefined, the data has been updated.
 */
export type DataChange = { __old: Data | undefined; __new: Data | undefined };

/** Dictionary of Data, which is used in several Group types. */
export type DataDict<T> = { [key: string]: Data<T> };

/** Data from the ParamDB database. */
export type Data<T = Leaf> = T | Group<T>;

/** Data that does not contain other Data. */
export type Leaf = number | boolean | string | null | Datetime | Quantity;

/** Data that can contain other Data. */
export type Group<T = Leaf> =
  | List<T>
  | Dict<T>
  | ParamList<T>
  | ParamDict<T>
  | Struct<T>
  | Param<T>;

/** Datetime object. */
export type Datetime = {
  __type: "datetime.datetime";
  isoformat: string;
};

/** Astropy Quantity object. */
export type Quantity = {
  __type: "astropy.units.quantity.Quantity";
  value: number;
  unit: string;
};

/** Ordinary list. */
export type List<T = Leaf> = Data<T>[];

/** Ordinary dictionary. */
export type Dict<T = Leaf> = {
  __dict: never; // Fake key so TypeScript can distinguish from ParamDict and Struct
} & DataDict<T>;

/** ParamDB ParamList object. */
export type ParamList<T = Leaf> = {
  __type: "ParamList";
  __items: List<T>;
};

/** ParamDB ParamDict object. */
export type ParamDict<T = Leaf> = {
  __type: "ParamDict";
} & DataDict<T>;

/** Object that is a ParamDB Struct. */
export type Struct<T = Leaf> = {
  __struct: never; // Fake key so TypeScript can distinguish from Dict and ParamDict
  __type: string;
} & DataDict<T>;

/** Object that is a ParamDB Param. */
export type Param<T = Leaf> = {
  __type: string;
  __last_updated: Datetime;
} & DataDict<T>;

/** Entry in the commit history. */
export type CommitEntry = {
  id: number;
  message: string;
  timestamp: string;
};

/** Path to data from the root. */
export type Path = string[];

/** Enum of leaf types. */
export const enum LeafType {
  Number,
  Boolean,
  String,
  Null,
  Datetime,
  Quantity,
}

/** Data from the ParamDB database. */
export type Data = Leaf | Group;

/** Data that does not contain other Data. */
export type Leaf = number | boolean | string | null | Datetime | Quantity;

/** Data that can contain other Data. */
export type Group = List | Dict | ParamList | ParamDict | Struct | Param;

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
export type List = Data[];

/** Ordinary dictionary. */
export type Dict = {
  __dict: never; // Fake key so TypeScript can distinguish from ParamDict and Struct
  [key: string]: Data;
};

/** ParamDB ParamList object. */
export type ParamList = {
  __type: "ParamList";
  __items: List;
};

/** ParamDB ParamDict object. */
export type ParamDict = {
  __type: "ParamDict";
  [key: string]: Data;
};

/** Object that is a ParamDB Struct. */
export type Struct = {
  __struct: never; // Fake key so TypeScript can distinguish from Dict and ParamDict
  __type: string;
  [key: string]: Data;
};

/** Object that is a ParamDB Param. */
export type Param = {
  __type: string;
  __last_updated: Datetime;
  [key: string]: Data;
};

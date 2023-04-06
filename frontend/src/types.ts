/** Entry in the commit history. */
export type CommitEntry = {
  id: number;
  message: string;
  timestamp: string;
};

export type List = Data[];

export type Dict = {
  __dict: never; // Fake key so TypeScript can distinguish
  [key: string]: Data;
};

export type Datetime = {
  __type: "datetime.datetime";
  isoformat: string;
};

export type Quantity = {
  __type: "astropy.units.quantity.Quantity";
  value: number;
  unit: string;
};

export type Struct = {
  __struct: never; // Fake key so TypeScript can distinguish from similar types
  __type: string;
  [key: string]: Data;
};

export type Param = {
  __type: string;
  __last_updated: Datetime;
  [key: string]: Data;
};

export type ParamList = {
  __type: "ParamList";
  __items: List;
};

export type ParamDict = {
  __type: "ParamDict";
  [key: string]: Data;
};

export type Leaf = number | boolean | string | null | Datetime | Quantity;

export type Group = List | Dict | Struct | Param | ParamList | ParamDict;

export type Data = Leaf | Group;

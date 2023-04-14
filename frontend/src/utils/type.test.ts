import { Data, Quantity } from "@/types";
import { isQuantity } from "@/utils/type";

const quantity: Quantity = {
  __type: "astropy.units.quantity.Quantity",
  value: 1.2e9,
  unit: "m",
};

type leafTestParams = {
  data: Data;
  predicate: (data: Data) => boolean;
  value: boolean;
};

describe.each`
  data        | predicate     | value
  ${quantity} | ${isQuantity} | ${true}
`("$predicate is $value for $data", ({ data, predicate, value }: leafTestParams) => {
  it(`test`, () => expect(predicate(data)).toBe(value));
});

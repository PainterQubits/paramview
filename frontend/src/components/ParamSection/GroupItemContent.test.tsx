import { render, screen } from "test-utils";
import GroupItemContent from "./GroupItemContent";

it("contains the name, type, and date", async () => {
  render(<GroupItemContent name="Test" type="Struct" timestamp={1672531200000} />);
  expect(screen.getByText("Test")).toBeInTheDocument();
  expect(screen.getByText("Struct")).toBeInTheDocument();
  expect(screen.getByDate(1672531200000)).toBeInTheDocument();
});

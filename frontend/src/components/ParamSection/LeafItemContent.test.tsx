import { render, screen } from "test-utils";
import { roundAtom } from "@/atoms/paramList";
import LeafItemContent from "./LeafItemContent";

it("contains the name and value", async () => {
  render(<LeafItemContent name="Test" value={123} />);
  expect(screen.getByText("Test")).toBeInTheDocument();
  expect(screen.getByText("123")).toBeInTheDocument();
});

it("rounds value by default", async () => {
  render(<LeafItemContent name="Test" value={1.2e9} />);
  expect(screen.getByText("Test")).toBeInTheDocument();
  expect(screen.getByText("1.2e+9")).toBeInTheDocument();
});

it("does not round value when roundAtom is false", async () => {
  render(<LeafItemContent name="Test" value={1.2e9} />, {
    initialValues: [[roundAtom, undefined]], // Toggles round atom to false
  });
  expect(screen.getByText("Test")).toBeInTheDocument();
  expect(screen.getByText("1200000000")).toBeInTheDocument();
});

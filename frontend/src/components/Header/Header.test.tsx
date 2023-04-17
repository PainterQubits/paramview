import { render } from "@testing-library/react";
import Header from "./Header";

const fetch = jest.spyOn(window, "fetch");

fetch.mockResolvedValue(new Response(JSON.stringify("test.db")));

it("renders", () => {
  render(<Header />);
});

import { waitFor } from "@testing-library/react";
import { databaseNameAtom } from "./api";

test("page title is set to database name", async () => {
  // Referencing forces the initial request (which sets the page title) to run
  databaseNameAtom;
  await waitFor(() => expect(document.title).toBe("test.db")); // Loaded
});

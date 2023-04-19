import { requestData } from "./api";

const notRunningMessage = "\n\nPlease check that paramview is running.";

// See setupTests.ts for mocked URL paths

it("throws error on fetch error", () =>
  expect(requestData("error")).rejects.toThrow(
    "Cannot fetch from URL." + notRunningMessage,
  ));

it("throws error on API error", () =>
  expect(requestData("api/error")).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR):" +
      "\n\nThere was an error.",
  ));

it("throws error if not found", () =>
  expect(requestData("not-found")).rejects.toThrow(
    "Data request responded with error code 404 (NOT FOUND):" + "\n\nURL not found.",
  ));

it("throws error with not running message if there is no response body", () =>
  expect(requestData("no-message")).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR)" +
      notRunningMessage,
  ));

it("returns requested JSON string", () =>
  expect(requestData("api/test-string")).resolves.toBe("test"));

it("returns requested JSON object", () =>
  expect(requestData("api/test-object")).resolves.toEqual({ value: 123 }));

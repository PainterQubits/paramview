import "whatwg-fetch"; // Polyfill Fetch API for jsdom
import { requestData } from "./api";

const url = "api/url"; // Since we mock fetch, this value is arbitrary

// Mock window.fetch
const mockFetch = jest.spyOn(window, "fetch");

beforeEach(() => {
  mockFetch.mockReset();
});

it("throws error on fetch error", async () => {
  mockFetch.mockRejectedValueOnce(new TypeError("Cannot fetch from that URL."));

  await expect(requestData(url)).rejects.toThrow(
    "Cannot fetch from that URL.\n\nPlease check that paramview is running.",
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("throws error on API error", async () => {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify({ description: "There was an error." }), {
      status: 500,
      statusText: "INTERNAL SERVER ERROR",
    }),
  );

  await expect(requestData(url)).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR):" +
      "\n\nThere was an error.",
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("throws error if not found", async () => {
  mockFetch.mockResolvedValueOnce(
    new Response("URL not found.", { status: 404, statusText: "NOT FOUND" }),
  );

  await expect(requestData(url)).rejects.toThrow(
    "Data request responded with error code 404 (NOT FOUND):" + "\n\nURL not found.",
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("throws error with not running message if there is no response body", async () => {
  mockFetch.mockResolvedValueOnce(
    new Response(undefined, {
      status: 500,
      statusText: "INTERNAL SERVER ERROR",
    }),
  );

  await expect(requestData(url)).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR)" +
      "\n\nPlease check that paramview is running.",
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("returns requested JSON string", async () => {
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify("test")));

  await expect(requestData(url)).resolves.toBe("test");
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("returns requested JSON object", async () => {
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ value: 123 })));

  await expect(requestData(url)).resolves.toEqual({ value: 123 });
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, undefined);
});

it("sends a POST request when body is given", async () => {
  mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(123)));

  await expect(requestData(url, { data: "test" })).resolves.toEqual(123);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: "test" }),
  });
});

import { requestData } from "@/utils/api";

const notRunningMessage = "\n\nPlease check that paramview is running.";

const fetch = jest.spyOn(global, "fetch");

afterEach(fetch.mockClear);

it("throws error on fetch error", async () => {
  fetch.mockRejectedValue(new TypeError("Cannot fetch from URL."));

  await expect(requestData("fetch-error")).rejects.toThrow(
    "Cannot fetch from URL." + notRunningMessage,
  );

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("fetch-error");
});

it("throws error on API error", async () => {
  fetch.mockResolvedValue(
    new Response(JSON.stringify({ description: "There was an error." }), {
      status: 500,
      statusText: "INTERNAL SERVER ERROR",
    }),
  );

  await expect(requestData("api/error")).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR):" +
      "\n\nThere was an error.",
  );

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("api/error");
});

it("throws error if not found", async () => {
  fetch.mockResolvedValue(
    new Response("URL not found.", {
      status: 404,
      statusText: "NOT FOUND",
    }),
  );

  await expect(requestData("not-found")).rejects.toThrow(
    "Data request responded with error code 404 (NOT FOUND):" + "\n\nURL not found.",
  );

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("not-found");
});

it("throws error with not running message if there is no response body", async () => {
  fetch.mockResolvedValue(
    new Response(undefined, {
      status: 500,
      statusText: "INTERNAL SERVER ERROR",
    }),
  );

  await expect(requestData("no-message")).rejects.toThrow(
    "Data request responded with error code 500 (INTERNAL SERVER ERROR)" +
      notRunningMessage,
  );

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("no-message");
});

it("returns requested JSON string", async () => {
  fetch.mockResolvedValue(new Response(JSON.stringify("test")));

  await expect(requestData<string>("api/string")).resolves.toBe("test");

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("api/string");
});

it("returns requested JSON object", async () => {
  fetch.mockResolvedValue(new Response(JSON.stringify({ value: 123 })));

  await expect(requestData<{ value: number }>("api/object")).resolves.toEqual({
    value: 123,
  });

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith("api/object");
});

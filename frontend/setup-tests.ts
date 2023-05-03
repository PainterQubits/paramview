import "whatwg-fetch"; // Polyfill Fetch API

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const response = (data: any) => new Response(JSON.stringify(data));

// Mock window.fetch
window.fetch = jest.fn(async (input) => {
  switch (input) {
    case "error":
      throw new TypeError("Cannot fetch from URL.");
    case "api/error":
      return new Response(JSON.stringify({ description: "There was an error." }), {
        status: 500,
        statusText: "INTERNAL SERVER ERROR",
      });
    case "no-message":
      return new Response(undefined, {
        status: 500,
        statusText: "INTERNAL SERVER ERROR",
      });
    case "api/test-string":
      return response("test");
    case "api/test-object":
      return response({ value: 123 });
    case "api/database-name":
      return response("test.db");
    case "api/commit-history":
      return response([
        { id: 1, message: "Initial commit", timestamp: "2023-01-01T00:00:00.000Z" },
        { id: 2, message: "Updated something", timestamp: "2023-01-02T00:00:00.000Z" },
        { id: 3, message: "Latest commit", timestamp: "2023-01-03T00:00:00.000Z" },
      ]);
  }

  return new Response("URL not found.", { status: 404, statusText: "NOT FOUND" });
});

// Polyfill Fetch API for JSDOM
import "whatwg-fetch";
import "@testing-library/jest-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const response = (data: any) => new Response(JSON.stringify(data));

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
        { id: 1, message: "Initial commit", timestamp: "Thu, 06 Apr 2023 20:08:57 GMT" },
        { id: 2, message: "Second commit", timestamp: "Thu, 06 Apr 2023 20:09:26 GMT" },
        { id: 3, message: "Third commit", timestamp: "Mon, 10 Apr 2023 17:34:28 GMT" },
      ]);
  }

  return new Response("URL not found.", { status: 404, statusText: "NOT FOUND" });
});

// Polyfill Fetch API for JSDOM
import "whatwg-fetch";

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
      return new Response(JSON.stringify("test"));
    case "api/test-object":
      return new Response(JSON.stringify({ value: 123 }));
  }

  return new Response("URL not found.", { status: 404, statusText: "NOT FOUND" });
});

const notRunningMessage = "\n\nPlease check that paramview is running.";

/**
 * Request data from the given URL and parse the response as JSON. If a body is included,
 * a POST request will be sent with the body as JSON; otherwise, a GET request is sent.
 */
export async function requestData<T>(url: string, body?: object) {
  await new Promise((res) => setTimeout(res, 500));
  let response: Response;

  const requestInit =
    body === undefined
      ? undefined
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        };

  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    const message = (error as Error).message;
    throw new Error(`${message}${notRunningMessage}`);
  }

  const responseText = await response.text();

  // Verify that request was successful
  if (!response.ok) {
    const { status, statusText } = response;

    let message: string;
    try {
      const responseData = await JSON.parse(responseText);
      message = String(responseData.description);
    } catch {
      message = responseText;
    }

    throw new Error(
      `Data request responded with error code ${status} (${statusText})` +
        (message.length > 0 ? ":\n\n" : "") +
        message +
        (message.length === 0 ? notRunningMessage : ""),
    );
  }

  return JSON.parse(responseText) as T;
}

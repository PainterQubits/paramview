const notRunningMessage = "\n\nPlease check that paramview is running.";

/** Request data from the given URL and parse the response as JSON. */
export async function requestData<T>(url: string) {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}${notRunningMessage}`);
  }

  const responseText = await response.text();

  // Verify that request was successful
  if (!response.ok) {
    const { status, statusText } = response;

    let message: string;
    try {
      const responseData = await JSON.parse(responseText);
      message = responseData.description;
      if (typeof responseData.description !== "string") throw new Error();
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

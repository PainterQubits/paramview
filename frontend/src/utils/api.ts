const notRunningMessage = "\n\nPlease check that paramview is running.";

export async function requestData<T>(url: string, requestInit?: RequestInit) {
  let response: Response;

  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw Error(`${message}${notRunningMessage}`);
  }

  const responseText = await response.text();

  // Verify that request was successful
  if (!response.ok) {
    const { status, statusText } = response;

    let message: string;
    try {
      const responseData = await JSON.parse(responseText);
      message = responseData.description;
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

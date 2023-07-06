/** Convert the given Unix timestamp or datetime string to a readable date string. */
export function formatDate(timestampOrString: number | string) {
  return new Date(timestampOrString).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Convert the given  Unix timestamp or datetime string to an ISO string in UTC time, with
 * Python-compatible timezone information (using "+00:00" instead of "Z").
 */
export function getISOString(timestampOrString: number | string) {
  return new Date(timestampOrString).toISOString().replace("Z", "+00:00");
}

/**
 * Convert the given Unix timestamp or datetime string to an ISO string in the local
 * timezone with no timezone information. This is intended to be used to get a valid input
 * value for datetime-local input (see
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#local_date_and_time_strings)
 * for more information.
 */
export function getLocalISOString(timestampOrString: number | string) {
  const date = new Date(timestampOrString);

  // Convert date so that it reflects the local time when viewed in UTC time. This is so
  // in the next step, we can convert to an ISO string in the local time rather than in
  // UTC time (the default).
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Remove timezone, milliseconds, and seconds if ":00"
  const localISOStringWithSeconds = date.toISOString().split(".")[0];
  return date.getSeconds() === 0
    ? localISOStringWithSeconds.slice(0, -3)
    : localISOStringWithSeconds;
}

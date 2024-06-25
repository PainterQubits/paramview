/**
 * Return a `Date` object from the given Unix timestamp (in seconds) or datetime string.
 */
function dateFromTimestampOrString(timestampOrString: number | string) {
  return new Date(
    typeof timestampOrString === "number"
      ? timestampOrString * 1000 // Convert from seconds to milliseconds
      : timestampOrString,
  );
}

/**
 * Convert the given Unix timestamp (in seconds) or datetime string to a readable date
 * string.
 */
export function formatDate(timestampOrString: number | string) {
  return dateFromTimestampOrString(timestampOrString).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

/**
 * Convert the given Unix timestamp (in seconds) or datetime string to an ISO string in
 * the local timezone with no timezone information. This is intended to be used to get a
 * valid input value for datetime-local input (see
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#local_date_and_time_strings)
 * for more information.
 */
export function getLocalISOString(timestampOrString: number | string) {
  const date = dateFromTimestampOrString(timestampOrString);

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

/** Return the current Unix timestamp (in seconds). */
export function nowTimestamp() {
  return Date.now() / 1000;
}

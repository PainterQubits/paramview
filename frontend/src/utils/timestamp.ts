/** Convert the given Unix timestamp (in seconds) to a Date object. */
function timestampToDate(timestamp: number) {
  const timestampMilliseconds = timestamp * 1000;
  return new Date(timestampMilliseconds);
}

/** Convert the given Unix timestamp (in seconds) to a readable date string. */
export function timestampToString(timestamp: number) {
  return timestampToDate(timestamp).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Convert the given Unix timestamp (in seconds) to a readable date string. */
export function timestampToString(timestamp: string) {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

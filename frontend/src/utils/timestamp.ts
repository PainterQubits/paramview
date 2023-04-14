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

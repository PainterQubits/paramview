/** Convert the datetime string or Unix timestamp to a readable date string. */
export function formatDate(timestamp: string | number) {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

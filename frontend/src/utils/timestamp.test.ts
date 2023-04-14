import { formatDate } from "@/utils/timestamp";

const date = new Date();
const timestamp = date.getTime();
const isoString = date.toISOString();
const utcString = date.toUTCString();

describe.each([timestamp, isoString, utcString])(
  "formatted date string from %p",
  (timestampOrString) => {
    const formattedString = formatDate(timestampOrString);

    // Note that the following tests just check that each component of the date and time
    // are present rather than checking for an exact string since formatDate() can return
    // different strings depending on the browser's locale settings.

    it("contains two digit year", () =>
      expect(formattedString).toContain(String(date.getFullYear()).slice(-2)));

    it("contains month number", () =>
      expect(formattedString).toContain(String(date.getMonth() + 1)));

    it("contains day number", () =>
      expect(formattedString).toContain(String(date.getDate())));

    it("contains hour number", () =>
      expect(formattedString).toMatch(
        new RegExp(`${date.getHours()}|${date.getHours() - 12}`),
      ));

    it("contains minutes", () =>
      expect(formattedString).toContain(String(date.getMinutes())));

    it("contains seconds", () =>
      expect(formattedString).toContain(String(date.getSeconds())));
  },
);

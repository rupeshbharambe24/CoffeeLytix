import { describe, it, expect } from "vitest";
import {
  formatDate,
  fromDateInputValue,
  initials,
  pluralize,
  toDateInputValue,
} from "@/lib/format";

describe("date helpers", () => {
  it("formats a date for display", () => {
    expect(formatDate(new Date(2026, 5, 25))).toBe("25 Jun 2026");
  });

  it("formats a date for an <input type=date>", () => {
    expect(toDateInputValue(new Date(2026, 5, 25))).toBe("2026-06-25");
  });

  it("parses an input-date string to local midnight", () => {
    const d = fromDateInputValue("2026-06-25");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(25);
  });
});

describe("initials", () => {
  it("uses first and last name", () => {
    expect(initials("Rahul Sharma")).toBe("RS");
  });
  it("handles a single name", () => {
    expect(initials("Rahul")).toBe("R");
  });
  it("handles empty input", () => {
    expect(initials("")).toBe("?");
  });
});

describe("pluralize", () => {
  it("returns singular for one", () => {
    expect(pluralize(1, "entry", "entries")).toBe("entry");
  });
  it("returns plural otherwise", () => {
    expect(pluralize(3, "entry", "entries")).toBe("entries");
    expect(pluralize(0, "café")).toBe("cafés");
  });
});

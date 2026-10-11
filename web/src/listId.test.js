import { describe, test, expect } from "vitest";
import { findListId } from "./listId.js";

const ID = "048ee36f-406e-4feb-8fee-b7d82d4425e9";

describe("findListId", () => {
    test("accepts a bare list ID", () => {
        expect(findListId(ID)).toBe(ID);
    });

    test("finds the ID inside a full share link", () => {
        expect(findListId(`https://todo.example.com/#list=${ID}`)).toBe(ID);
    });

    test("ignores surrounding whitespace and capital letters", () => {
        expect(findListId(`  ${ID.toUpperCase()}  `)).toBe(ID);
    });

    test("returns null when there's no ID", () => {
        expect(findListId("hello")).toBeNull();
        expect(findListId("")).toBeNull();
    });
});

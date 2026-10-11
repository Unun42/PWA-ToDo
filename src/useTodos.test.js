import { describe, test, expect } from "vitest";
import { todosReducer } from "./useTodos.js";

// The reducer is a plain function (state + action in, new state out), so it can
// be tested without rendering any React components or calling the API.

const todo = (id, text, completed = 0) => ({ id, text, completed });

const ready = (todos) => ({
    todos,
    status: "ready",
    error: null,
    actionError: null
});

describe("todosReducer", () => {
    test("FETCH_START enters loading and clears the previous error", () => {
        const state = { ...ready([]), status: "error", error: "offline" };
        const next = todosReducer(state, { type: "FETCH_START" });
        expect(next.status).toBe("loading");
        expect(next.error).toBeNull();
    });

    test("FETCH_SUCCESS stores the todos", () => {
        const todos = [todo(1, "a")];
        const next = todosReducer(ready([]), { type: "FETCH_SUCCESS", payload: todos });
        expect(next.status).toBe("ready");
        expect(next.todos).toEqual(todos);
    });

    test("FETCH_ERROR stores the error message", () => {
        const next = todosReducer(ready([]), { type: "FETCH_ERROR", payload: "offline" });
        expect(next.status).toBe("error");
        expect(next.error).toBe("offline");
    });

    test("ADD_TODO puts the new todo first", () => {
        const next = todosReducer(ready([todo(1, "old")]), {
            type: "ADD_TODO",
            payload: todo(2, "new")
        });
        expect(next.todos.map((t) => t.text)).toEqual(["new", "old"]);
    });

    test("TOGGLE_TODO replaces only the matching todo", () => {
        const next = todosReducer(ready([todo(1, "a"), todo(2, "b")]), {
            type: "TOGGLE_TODO",
            payload: todo(2, "b", 1)
        });
        expect(next.todos).toEqual([todo(1, "a"), todo(2, "b", 1)]);
    });

    test("DELETE_TODO removes the todo with that id", () => {
        const next = todosReducer(ready([todo(1, "a"), todo(2, "b")]), {
            type: "DELETE_TODO",
            payload: 1
        });
        expect(next.todos).toEqual([todo(2, "b")]);
    });

    test("a successful action clears the last action error", () => {
        const state = { ...ready([]), actionError: "offline" };
        const next = todosReducer(state, { type: "ADD_TODO", payload: todo(1, "a") });
        expect(next.actionError).toBeNull();
    });

    test("ACTION_ERROR and CLEAR_ACTION_ERROR set and clear the action error", () => {
        const failed = todosReducer(ready([]), { type: "ACTION_ERROR", payload: "offline" });
        expect(failed.actionError).toBe("offline");

        const cleared = todosReducer(failed, { type: "CLEAR_ACTION_ERROR" });
        expect(cleared.actionError).toBeNull();
    });

    test("doesn't modify the state it was given", () => {
        const state = ready([todo(1, "a")]);
        const copy = structuredClone(state);
        todosReducer(state, { type: "DELETE_TODO", payload: 1 });
        expect(state).toEqual(copy);
    });
});

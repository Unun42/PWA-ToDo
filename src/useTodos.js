import { useEffect, useReducer, useState } from "react";
import { todosApi } from "./api.js";

const initialState = {
    todos: [],
    status: "loading", // "loading" | "ready" | "error"
    error: null, // why loading failed
    actionError: null // why the last add/toggle/delete failed
};

// Every state change goes through this one function, which makes it easy to see
// (and test) exactly what each action does to the state.
export function todosReducer(state, action) {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, status: "loading", error: null };

        case "FETCH_SUCCESS":
            return { ...state, status: "ready", todos: action.payload };

        case "FETCH_ERROR":
            return { ...state, status: "error", error: action.payload };

        case "ADD_TODO":
            return {
                ...state,
                actionError: null,
                todos: [action.payload, ...state.todos]
            };

        case "TOGGLE_TODO":
            return {
                ...state,
                actionError: null,
                todos: state.todos.map((todo) =>
                    todo.id === action.payload.id ? action.payload : todo
                )
            };

        case "DELETE_TODO":
            return {
                ...state,
                actionError: null,
                todos: state.todos.filter((todo) => todo.id !== action.payload)
            };

        case "ACTION_ERROR":
            return { ...state, actionError: action.payload };

        case "CLEAR_ACTION_ERROR":
            return { ...state, actionError: null };

        default:
            return state;
    }
}

export function useTodos(listId) {
    const [state, dispatch] = useReducer(todosReducer, initialState);
    // Bumping this number re-runs the effect below, which reloads the list.
    const [reloadCount, setReloadCount] = useState(0);

    // Load the todos on startup, on retry, and whenever the user switches lists.
    useEffect(() => {
        // If the list changes before this request finishes, its answer is for the
        // old list and must be thrown away. React runs the returned cleanup
        // function at that moment, which flips `ignore` to true.
        let ignore = false;

        async function load() {
            dispatch({ type: "FETCH_START" });
            try {
                const todos = await todosApi.getAll(listId);
                if (!ignore) dispatch({ type: "FETCH_SUCCESS", payload: todos });
            } catch (err) {
                if (!ignore) dispatch({ type: "FETCH_ERROR", payload: err.message });
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, [listId, reloadCount]);

    // The actions below never throw: failures are shown via `actionError`.
    // addTodo returns true/false so the form knows whether to clear its input.

    async function addTodo(text) {
        try {
            const created = await todosApi.create(listId, text);
            dispatch({ type: "ADD_TODO", payload: created });
            return true;
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
            return false;
        }
    }

    async function toggleTodo(id) {
        try {
            const updated = await todosApi.toggle(listId, id);
            dispatch({ type: "TOGGLE_TODO", payload: updated });
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
        }
    }

    async function deleteTodo(id) {
        try {
            await todosApi.remove(listId, id);
            dispatch({ type: "DELETE_TODO", payload: id });
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
        }
    }

    function dismissActionError() {
        dispatch({ type: "CLEAR_ACTION_ERROR" });
    }

    return {
        ...state,
        reload: () => setReloadCount((count) => count + 1),
        addTodo,
        toggleTodo,
        deleteTodo,
        dismissActionError
    };
}

import { useEffect, useReducer } from "react";
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

export function useTodos() {
    const [state, dispatch] = useReducer(todosReducer, initialState);

    async function load() {
        dispatch({ type: "FETCH_START" });
        try {
            const todos = await todosApi.getAll();
            dispatch({ type: "FETCH_SUCCESS", payload: todos });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err.message });
        }
    }

    useEffect(() => {
        load();
    }, []);

    // The actions below never throw: failures are shown via `actionError`.
    // addTodo returns true/false so the form knows whether to clear its input.

    async function addTodo(text) {
        try {
            const created = await todosApi.create(text);
            dispatch({ type: "ADD_TODO", payload: created });
            return true;
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
            return false;
        }
    }

    async function toggleTodo(id) {
        try {
            const updated = await todosApi.toggle(id);
            dispatch({ type: "TOGGLE_TODO", payload: updated });
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
        }
    }

    async function deleteTodo(id) {
        try {
            await todosApi.remove(id);
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
        reload: load,
        addTodo,
        toggleTodo,
        deleteTodo,
        dismissActionError
    };
}

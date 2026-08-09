import { useEffect, useReducer, useCallback } from "react";
import { todosReducer, initialState } from "../reducers/todosReducer.js";
import { todosApi } from "../api/todos.js";

export function useTodos() {
    const [state, dispatch] = useReducer(todosReducer, initialState);

    useEffect(() => {
        dispatch({ type: "FETCH_START" });
        todosApi
            .getAll()
            .then((todos) => dispatch({ type: "FETCH_SUCCESS", payload: todos }))
            .catch((err) =>
                dispatch({ type: "FETCH_ERROR", payload: err.message })
            );
    }, []);

    const addTodo = useCallback(async (text) => {
        const created = await todosApi.create(text);
        dispatch({ type: "ADD_TODO", payload: created });
    }, []);

    const toggleTodo = useCallback(async (id) => {
        const updated = await todosApi.toggle(id);
        dispatch({ type: "TOGGLE_TODO", payload: updated });
    }, []);

    const deleteTodo = useCallback(async (id) => {
        await todosApi.remove(id);
        dispatch({ type: "DELETE_TODO", payload: id });
    }, []);

    return { ...state, addTodo, toggleTodo, deleteTodo };
}

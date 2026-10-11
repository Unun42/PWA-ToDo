import { useEffect, useReducer, useCallback } from "react";
import { todosReducer, initialState } from "../reducers/todosReducer.js";
import { todosApi } from "../api/todos.js";

export function useTodos() {
    const [state, dispatch] = useReducer(todosReducer, initialState);

    const load = useCallback(() => {
        dispatch({ type: "FETCH_START" });
        todosApi
            .getAll()
            .then((todos) => dispatch({ type: "FETCH_SUCCESS", payload: todos }))
            .catch((err) =>
                dispatch({ type: "FETCH_ERROR", payload: err.message })
            );
    }, []);

    useEffect(load, [load]);

    // Mutations never throw: a failure is surfaced through `actionError`, and the
    // returned boolean lets callers react (e.g. TodoForm keeps the typed text).
    const runAction = useCallback(async (apiCall, onSuccess) => {
        try {
            const result = await apiCall();
            dispatch(onSuccess(result));
            return true;
        } catch (err) {
            dispatch({ type: "ACTION_ERROR", payload: err.message });
            return false;
        }
    }, []);

    const addTodo = useCallback(
        (text) =>
            runAction(
                () => todosApi.create(text),
                (created) => ({ type: "ADD_TODO", payload: created })
            ),
        [runAction]
    );

    const toggleTodo = useCallback(
        (id) =>
            runAction(
                () => todosApi.toggle(id),
                (updated) => ({ type: "TOGGLE_TODO", payload: updated })
            ),
        [runAction]
    );

    const deleteTodo = useCallback(
        (id) =>
            runAction(
                () => todosApi.remove(id),
                () => ({ type: "DELETE_TODO", payload: id })
            ),
        [runAction]
    );

    const dismissActionError = useCallback(
        () => dispatch({ type: "CLEAR_ACTION_ERROR" }),
        []
    );

    return {
        ...state,
        reload: load,
        addTodo,
        toggleTodo,
        deleteTodo,
        dismissActionError
    };
}

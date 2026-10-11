const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...options
        });
    } catch {
        // fetch() only rejects when the request never got a response — offline,
        // DNS failure, CORS rejection. Its own message ("Failed to fetch") is
        // browser-specific and unhelpful to show a user.
        throw new Error("Network error — check your connection and try again.");
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) {
        return null;
    }

    return res.json();
}

export const todosApi = {
    getAll: (listId) => request(`/lists/${listId}/todos`),
    create: (listId, text) =>
        request(`/lists/${listId}/todos`, {
            method: "POST",
            body: JSON.stringify({ text })
        }),
    toggle: (listId, id) =>
        request(`/lists/${listId}/todos/${id}`, { method: "PATCH" }),
    remove: (listId, id) =>
        request(`/lists/${listId}/todos/${id}`, { method: "DELETE" })
};

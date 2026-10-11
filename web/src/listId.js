// Each todo list is identified by a random ID (a UUID). Anyone who has the ID can
// use the list, so sharing a list between devices means sharing its ID — usually as
// a link like https://your-app.example/#list=<id>.

const STORAGE_KEY = "listId";
const ID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// Pull a list ID out of whatever the user pasted: a full link or just the ID.
export function findListId(text) {
    const match = text.match(ID_PATTERN);
    return match ? match[0].toLowerCase() : null;
}

export function saveListId(id) {
    localStorage.setItem(STORAGE_KEY, id);
}

// Called once on startup. Priority: a list ID in the URL (someone opened a shared
// link), then the one this device used last time, otherwise start a new list.
export function getInitialListId() {
    const fromUrl = findListId(window.location.hash);
    if (fromUrl) {
        saveListId(fromUrl);
        // Tidy the address bar so the ID isn't left sitting in it.
        history.replaceState(null, "", window.location.pathname);
        return fromUrl;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;

    const created = crypto.randomUUID();
    saveListId(created);
    return created;
}

export function shareLink(id) {
    return `${window.location.origin}/#list=${id}`;
}

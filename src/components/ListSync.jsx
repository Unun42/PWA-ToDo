import { useState } from "react";
import { findListId, shareLink } from "../listId.js";

export function ListSync({ listId, onOpenList }) {
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState("");
    const [error, setError] = useState(null);

    const link = shareLink(listId);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpen = (e) => {
        e.preventDefault();
        const id = findListId(pasted);

        if (!id) {
            setError("That doesn't look like a list link or code.");
            return;
        }

        setError(null);
        setPasted("");
        onOpenList(id);
    };

    return (
        <details className="rounded-md border border-slate-800 px-3 py-2 text-sm">
            <summary className="cursor-pointer text-slate-400">
                Use on another device
            </summary>

            <div className="mt-3 space-y-4">
                <div className="space-y-2">
                    <p className="text-slate-400">
                        Open this link on your other device, or paste it into the
                        box below there. Anyone with the link can see and edit this
                        list, so share it carefully.
                    </p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={link}
                            aria-label="Link to this list"
                            onFocus={(e) => e.target.select()}
                            className="flex-1 min-w-0 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-300"
                        />
                        <button
                            onClick={handleCopy}
                            className="rounded-md border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleOpen} className="space-y-2">
                    <p className="text-slate-400">
                        Have a link from another device? Paste it here to switch
                        to that list.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={pasted}
                            onChange={(e) => setPasted(e.target.value)}
                            placeholder="Paste a list link"
                            aria-label="List link from another device"
                            className="flex-1 min-w-0 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={!pasted.trim()}
                            className="rounded-md border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                        >
                            Open
                        </button>
                    </div>
                    {error && <p className="text-red-400">{error}</p>}
                </form>
            </div>
        </details>
    );
}

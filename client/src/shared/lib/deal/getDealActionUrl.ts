export function getDealActionUrl(url?: string | null) {
    if (!url) return null;

    const trimmed = url.trim();

    if (!trimmed) return null;

    if (trimmed.startsWith('@')) {
        return `https://t.me/${trimmed.slice(1)}`;
    }

    return trimmed;
}
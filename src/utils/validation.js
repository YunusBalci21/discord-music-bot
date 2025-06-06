export function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

export function formatDuration(duration) {
    const parts = duration.split(':');
    if (parts.length === 2) {
        return `${parts[0]}m ${parts[1]}s`;
    }
    return duration;
}
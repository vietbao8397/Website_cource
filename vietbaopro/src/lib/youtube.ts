export function parseYouTubeDuration(duration: string): number {
    // YouTube duration format is ISO 8601 (e.g. PT1M30S, PT1H2M10S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    // Return total minutes (rounded up)
    return hours * 60 + minutes + (seconds > 0 ? 1 : 0);
}

export function extractYouTubeId(urlOrId: string): string {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[7].length === 11) ? match[7] : urlOrId;
}

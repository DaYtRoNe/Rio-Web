/** YouTube video ids are always 11 chars of [A-Za-z0-9_-]. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Accepts whatever YouTube hands you — a watch URL, a share link with `?si=`
 * tracking, a timestamp, an embed or Shorts URL, or just the bare id — and
 * returns the short form used in the WhatsApp message:
 *
 *   https://youtu.be/9rLM8tjzss8
 *
 * Returns null if it isn't a YouTube link, so the UI can say so instead of
 * putting a broken address in front of parents.
 */
export function normalizeYouTubeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (VIDEO_ID.test(trimmed)) return `https://youtu.be/${trimmed}`;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = match ? match[1] : null;
    }
  }

  return id && VIDEO_ID.test(id) ? `https://youtu.be/${id}` : null;
}

/** True for anything we'd accept, used for inline validation feedback. */
export function isYouTubeUrl(input: string): boolean {
  return normalizeYouTubeUrl(input) !== null;
}

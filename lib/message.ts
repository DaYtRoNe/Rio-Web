/**
 * Builds the daily WhatsApp message.
 *
 * Reproduces the format exactly:
 *
 *   2026-10-02
 *
 *   1-5🔻
 *
 *   2 ශ්‍රේණිය - ඉංග්‍රීසි (2026-10-02)
 *   https://youtu.be/9rLM8tjzss8
 *
 *   SM🔻
 *
 *   ...
 *
 * Only classes that actually have a link appear. Cancelled classes and ones
 * still waiting for a link are left out, and a section with nothing to show is
 * skipped entirely rather than leaving a bare heading behind.
 */

export type MessageItem = {
  /** Section heading text, e.g. "SM🔻". */
  sectionHeading: string;
  sectionOrder: number;
  /** Grade priority, for ordering within a section. */
  priority: number;
  /** Secondary sort, matching every other screen. */
  subject: string;
  /** The full title line, date included. */
  title: string;
  url: string | null;
  isCancelled: boolean;
};

export function buildMessage(date: string, items: MessageItem[]): string {
  const ready = items.filter((item) => !item.isCancelled && item.url);

  const sections = new Map<string, { order: number; lines: MessageItem[] }>();
  for (const item of ready) {
    const bucket = sections.get(item.sectionHeading) ?? {
      order: item.sectionOrder,
      lines: [],
    };
    bucket.lines.push(item);
    sections.set(item.sectionHeading, bucket);
  }

  const blocks: string[] = [date];

  const ordered = [...sections.entries()].sort((a, b) => a[1].order - b[1].order);

  for (const [heading, bucket] of ordered) {
    bucket.lines.sort(
      (a, b) => a.priority - b.priority || a.subject.localeCompare(b.subject, "si")
    );
    blocks.push(heading);
    for (const line of bucket.lines) {
      blocks.push(`${line.title}\n${line.url}`);
    }
  }

  // One blank line between every block, which is exactly the shape of the
  // original message.
  return blocks.join("\n\n");
}

export type MessageStats = {
  total: number;
  withLink: number;
  cancelled: number;
  missing: number;
};

export function messageStats(items: MessageItem[]): MessageStats {
  const cancelled = items.filter((i) => i.isCancelled).length;
  const withLink = items.filter((i) => !i.isCancelled && i.url).length;
  return {
    total: items.length,
    withLink,
    cancelled,
    missing: items.length - cancelled - withLink,
  };
}

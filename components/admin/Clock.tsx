"use client";

import { useEffect, useState } from "react";
import { TIME_ZONE } from "@/lib/date";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Live HH:mm:ss clock in Sri Lanka time (the old app had one in its title bar). */
export default function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums text-on-surface-variant" suppressHydrationWarning>
      {time ?? "--:--:--"}
    </span>
  );
}

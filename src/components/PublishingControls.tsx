import { useEffect, useMemo, useState } from "react";
import type {
  ChannelKey,
  Visibility,
  PublishingOptions,
} from "@/types/audio-merge";

type Props = {
  value?: PublishingOptions;
  onChange: (v: PublishingOptions) => void;
};

/* ---------- helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DDTHH:mm" in local time (for <input type="datetime-local">) */
function toInputLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (local) -> "YYYY-MM-DDTHH:mm:ssZ" (UTC wire) */
function localInputToUtcIso(local: string) {
  // new Date(local) is treated as *local wall time* by the browser.
  // toISOString() returns UTC.
  return new Date(local).toISOString().replace(".000Z", "Z");
}

/** ISO with Z/offset (or even naked local) -> input local "YYYY-MM-DDTHH:mm" */
function isoToInputLocal(iso: string) {
  return toInputLocal(new Date(iso));
}

export default function PublishingControls({ value, onChange }: Props) {
  const [channel, setChannel] = useState<ChannelKey>(
    value?.channel ?? "Bolati Pustake"
  );
  const [visibility, setVisibility] = useState<Visibility>(
    value?.visibility ?? "private"
  );

  // Local input value (YYYY-MM-DDTHH:mm)
  const [scheduledLocal, setScheduledLocal] = useState<string>(() => {
    if (value?.scheduledTime)
      return isoToInputLocal(value.scheduledTime).slice(0, 16);
    return "";
  });

  // Min = now (local)
  const minDateTime = useMemo(() => toInputLocal(new Date()), []);

  // Compute UTC wire value only when needed
  const scheduledTimeUtc =
    visibility === "schedule" && scheduledLocal
      ? localInputToUtcIso(scheduledLocal) // e.g., 05:30 IST -> 00:00:00Z
      : null;

  // Push outward (always UTC when scheduled)
  useEffect(() => {
    onChange({ channel, visibility, scheduledTime: scheduledTimeUtc });
  }, [channel, visibility, scheduledLocal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate with real dates
  const isScheduleInvalid =
    visibility === "schedule" &&
    (!scheduledLocal || new Date(scheduledLocal) <= new Date(minDateTime));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Publishing</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Channel</span>
          <select
            className="border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelKey)}
          >
            <option value="Bolati Pustake">Bolati Pustake</option>
            <option value="SahityaRatna">SahityaRatna</option>
            <option value="Katharas">Katharas</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Visibility</span>
          <select
            className="border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
            <option value="schedule">Schedule</option>
          </select>
        </label>

        {visibility === "schedule" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Publish at</span>
            <input
              type="datetime-local"
              className="border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
              value={scheduledLocal}
              min={minDateTime}
              onChange={(e) => setScheduledLocal(e.target.value)}
            />
            {isScheduleInvalid && (
              <span className="text-xs text-amber-700">
                Choose a time in the future.
              </span>
            )}
            {/* Debug (optional): shows what gets sent */}
            {/* <span className="text-[11px] text-gray-500 mt-1">UTC: {scheduledTimeUtc ?? "-"}</span> */}
          </label>
        )}
      </div>
    </div>
  );
}

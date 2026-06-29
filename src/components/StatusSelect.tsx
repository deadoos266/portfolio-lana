"use client";

import { useTransition } from "react";
import { updateStatus } from "@/app/dashboard/actions";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/types";

interface StatusSelectProps {
  id: string;
  status: ApplicationStatus;
}

export function StatusSelect({ id, status }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          void updateStatus(id, e.target.value);
        })
      }
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-900 disabled:opacity-50"
    >
      {APPLICATION_STATUSES.map((value) => (
        <option key={value} value={value}>
          {STATUS_LABELS[value]}
        </option>
      ))}
    </select>
  );
}

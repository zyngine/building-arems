"use client";

import { RoomStatus } from "@/lib/types";
import { getStatusLabel, getStatusTextColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: RoomStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const textColor = getStatusTextColor(status);
  const bgColors: Record<RoomStatus, string> = {
    available: "rgba(26,82,118,0.5)",
    pledged: "rgba(125,90,11,0.5)",
    sold: "rgba(14,107,58,0.5)",
  };

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ color: textColor, backgroundColor: bgColors[status] }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

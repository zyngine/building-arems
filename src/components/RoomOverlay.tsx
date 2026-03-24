"use client";

import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { getRoomColor, formatCurrency } from "@/lib/utils";

interface RoomOverlayProps {
  room: RoomWithDonation;
  dimmed: boolean;
  onClick: (room: RoomWithDonation) => void;
}

export function RoomOverlay({ room, dimmed, onClick }: RoomOverlayProps) {
  const status: RoomStatus = room.donation?.status ?? "available";
  const color = getRoomColor(room.type, status);
  const isCorridor = room.type === "corridor";

  return (
    <div
      className={`absolute flex flex-col items-center justify-center text-center transition-all duration-200 ${
        isCorridor
          ? "cursor-default"
          : "cursor-pointer hover:brightness-125 hover:scale-[1.02]"
      }`}
      style={{
        left: `${room.coordinates.x}%`,
        top: `${room.coordinates.y}%`,
        width: `${room.coordinates.width}%`,
        height: `${room.coordinates.height}%`,
        backgroundColor: `${color}59`,
        border: `2px solid ${color}`,
        borderRadius: "3px",
        opacity: dimmed ? 0.25 : 1,
      }}
      onClick={isCorridor ? undefined : () => onClick(room)}
      role={isCorridor ? undefined : "button"}
      tabIndex={isCorridor ? undefined : 0}
      onKeyDown={
        isCorridor
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onClick(room);
            }
      }
    >
      <span
        className="font-bold text-[10px] sm:text-xs leading-tight px-1"
        style={{ color: isCorridor ? "#6b6b6b" : `${color}cc` }}
      >
        {room.name}
      </span>
      {!isCorridor && (
        <span
          className="text-[8px] sm:text-[10px] mt-0.5 px-1 truncate max-w-full"
          style={{ color: `${color}aa` }}
        >
          {room.donation
            ? `${status.toUpperCase()} - ${room.donation.donor_name}`
            : formatCurrency(room.price)}
        </span>
      )}
    </div>
  );
}

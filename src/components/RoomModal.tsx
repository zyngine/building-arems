"use client";

import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { getRoomColor } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { RoomInfoDisplay } from "./RoomInfoDisplay";
import { RoomForm } from "./RoomForm";

interface RoomModalProps {
  room: RoomWithDonation | null;
  isAdmin: boolean;
  onClose: () => void;
}

export function RoomModal({ room, isAdmin, onClose }: RoomModalProps) {
  if (!room) return null;

  const status: RoomStatus = room.donation?.status ?? "available";
  const color = getRoomColor(room.type, status);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-xl sm:rounded-xl w-full sm:max-w-md mx-0 sm:mx-4 max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: `linear-gradient(180deg, ${color} 0%, #111827 100%)`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-serif text-xl font-bold">
                {room.name}
              </h2>
              {room.description && (
                <p className="text-gray-400 text-sm mt-1">
                  {room.description}
                </p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="px-6 pb-6">
          {isAdmin ? (
            <RoomForm room={room} onClose={onClose} />
          ) : (
            <RoomInfoDisplay room={room} />
          )}

          {!isAdmin && (
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 bg-border text-gray-400 rounded-md text-sm hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

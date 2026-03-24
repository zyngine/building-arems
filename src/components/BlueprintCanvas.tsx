"use client";

import { useState, useEffect } from "react";
import { RoomWithDonation } from "@/lib/types";
import { RoomOverlay } from "./RoomOverlay";

interface BlueprintCanvasProps {
  rooms: RoomWithDonation[];
  dimmedFilter: (room: RoomWithDonation) => boolean;
  onRoomClick: (room: RoomWithDonation) => void;
}

export function BlueprintCanvas({
  rooms,
  dimmedFilter,
  onRoomClick,
}: BlueprintCanvasProps) {
  const [hasImage, setHasImage] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = "/blueprint.png";
  }, []);

  if (hasImage === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading blueprint...</div>
      </div>
    );
  }

  if (!hasImage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-serif">
            No blueprint image found
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Add your blueprint image as{" "}
            <code className="text-gold/70 bg-border px-1.5 py-0.5 rounded text-xs">
              public/blueprint.png
            </code>{" "}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-5 overflow-auto">
      <div className="relative w-full max-w-6xl mx-auto">
        <img
          src="/blueprint.png"
          alt="Building Blueprint"
          className="w-full h-auto block"
          draggable={false}
        />
        {rooms.map((room) => (
          <RoomOverlay
            key={room.id}
            room={room}
            dimmed={dimmedFilter(room)}
            onClick={onRoomClick}
          />
        ))}
      </div>
    </div>
  );
}

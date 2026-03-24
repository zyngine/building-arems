"use client";

import { RoomWithDonation } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface RoomInfoDisplayProps {
  room: RoomWithDonation;
}

export function RoomInfoDisplay({ room }: RoomInfoDisplayProps) {
  return (
    <div>
      <div className="text-center py-4 mb-4 border-b border-border">
        <div className="text-gold font-serif text-3xl font-bold">
          {formatCurrency(room.price)}
        </div>
        <div className="text-gray-500 text-xs mt-1">Naming Rights</div>
      </div>

      <div className="bg-[#0d1117] rounded-lg p-4 text-center">
        {room.donation ? (
          <>
            <p className="text-white font-medium">
              {room.donation.donor_name}
            </p>
            {room.donation.dedication_text && (
              <p className="text-gray-400 text-sm mt-2 italic">
                &ldquo;{room.donation.dedication_text}&rdquo;
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-400 text-sm">
              This space is available for naming rights
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Contact campaign leadership for details
            </p>
          </>
        )}
      </div>
    </div>
  );
}

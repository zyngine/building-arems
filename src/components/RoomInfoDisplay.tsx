"use client";

import { RoomWithDonation } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CONTACT_EMAIL, contactMailto } from "@/lib/constants";

interface RoomInfoDisplayProps {
  room: RoomWithDonation;
}

export function RoomInfoDisplay({ room }: RoomInfoDisplayProps) {
  return (
    <div>
      <div className="text-center py-5 mb-4 border-b border-border">
        <div className="text-gray-400 text-[11px] uppercase tracking-[0.18em] mb-1">
          Naming Rights
        </div>
        <div className="text-gold font-serif text-4xl font-bold">
          {formatCurrency(room.price)}
        </div>
      </div>

      <div className="bg-[#0d1117] border border-border rounded-lg p-5 text-center">
        {room.donation ? (
          <>
            <p className="text-gray-400 text-[11px] uppercase tracking-[0.18em] mb-1.5">
              Named by
            </p>
            <p className="text-white font-serif text-lg font-semibold">
              {room.donation.donor_name}
            </p>
            {room.donation.dedication_text && (
              <p className="text-gray-300 text-sm mt-2 italic">
                &ldquo;{room.donation.dedication_text}&rdquo;
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-200 text-sm font-medium">
              This space is available for naming rights
            </p>
            <p className="text-gray-400 text-sm mt-1.5">
              Contact campaign leadership for details
            </p>
            <a
              href={contactMailto(`Naming rights inquiry: ${room.name}`)}
              title={`Email ${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-gold/40 bg-gold/10 text-gold text-sm font-semibold hover:bg-gold/20 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              Campaign Contact
            </a>
          </>
        )}
      </div>
    </div>
  );
}

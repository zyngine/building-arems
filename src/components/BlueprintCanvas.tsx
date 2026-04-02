"use client";

import { RoomWithDonation, RoomStatus, RoomType } from "@/lib/types";
import { getRoomColor, formatCurrency } from "@/lib/utils";

interface BlueprintCanvasProps {
  rooms: RoomWithDonation[];
  dimmedFilter: (room: RoomWithDonation) => boolean;
  onRoomClick: (room: RoomWithDonation) => void;
}

const TYPE_COLORS: Record<RoomType | "_", { f: string; s: string }> = {
  bay: { f: "rgba(26,82,118,0.5)", s: "#1a5276" },
  bedroom: { f: "rgba(26,92,92,0.5)", s: "#1a5c5c" },
  office: { f: "rgba(44,62,122,0.5)", s: "#2c3e7a" },
  common: { f: "rgba(108,52,131,0.5)", s: "#6c3483" },
  utility: { f: "rgba(93,78,96,0.5)", s: "#5d4e60" },
  corridor: { f: "rgba(31,41,55,0.2)", s: "#1f2937" },
  _: { f: "rgba(31,41,55,0.2)", s: "#1f2937" },
};

const STATUS_FILL: Record<RoomStatus, { f: string; s: string }> = {
  available: { f: "", s: "" }, // use type color
  pledged: { f: "rgba(125,90,11,0.5)", s: "#7d5a0b" },
  sold: { f: "rgba(14,107,58,0.5)", s: "#0e6b3a" },
};

// Context rooms (non-naming, not clickable)
const CTX_ROOMS = [
  { name: "Corridor", x: 52, y: 58, w: 13, h: 169 },
  { name: "Restroom", x: 65, y: 58, w: 50, h: 67 },
  { name: "Restroom", x: 65, y: 125, w: 50, h: 67 },
  { name: "Restroom", x: 637, y: 118, w: 60, h: 57 },
  { name: "Restroom", x: 697, y: 118, w: 60, h: 57 },
  { name: "Corridor", x: 625, y: 62, w: 12, h: 113 },
  { name: "Corridor", x: 868, y: 50, w: 12, h: 125 },
  { name: "Lobby", x: 875, y: 200, w: 55, h: 60 },
];

function shortenName(name: string): string {
  return name
    .replace("Apparatus ", "")
    .replace(" Room", "")
    .replace("Kitchen (West)", "Kitchen W")
    .replace("Oxygen ", "O\u2082 ")
    .replace("Mechanical", "Mech.")
    .replace("Office Supply", "Office Sup.")
    .replace("Daily Supply ", "D.Supply ");
}

function shortenPrice(price: number): string {
  const dollars = price / 100;
  if (dollars >= 1000) return `$${dollars / 1000}K`;
  return `$${dollars}`;
}

export function BlueprintCanvas({
  rooms,
  dimmedFilter,
  onRoomClick,
}: BlueprintCanvasProps) {
  return (
    <div className="flex-1 p-4 sm:p-5 overflow-auto">
      <div className="w-full max-w-[1500px] mx-auto bg-[#111827] rounded-xl border border-[#1f2937] p-6 overflow-x-auto">
        <svg viewBox="-4 -4 948 300" className="w-full h-auto block min-w-[900px]">
          {/* Building fill */}
          <rect x={0} y={0} width={250} height={260} fill="rgba(30,42,65,0.7)" />
          <rect x={250} y={0} width={375} height={260} fill="rgba(30,42,65,0.7)" />
          <rect x={625} y={0} width={305} height={260} fill="rgba(30,42,65,0.7)" />

          {/* Building outline - clickable for building naming rights */}
          <rect
            x={-6} y={-6} width={942} height={272}
            fill="none" stroke="transparent" strokeWidth={16}
            style={{ cursor: "pointer", pointerEvents: "stroke" }}
            onClick={() => {
              // Building naming rights handled by parent via a synthetic room
              const syntheticRoom = {
                id: "building",
                slug: "building-naming",
                name: "Building Naming Rights",
                type: "common" as RoomType,
                description: "Name the entire AREMS building",
                price: 50000000,
                coordinates: { x: 0, y: 0, w: 930, h: 260 },
                sort_order: 0,
                created_at: "",
                donation: null,
              };
              onRoomClick(syntheticRoom);
            }}
          />
          <rect x={0} y={0} width={930} height={260} fill="none" stroke="#7a9cc0" strokeWidth={8} rx={1} style={{ pointerEvents: "none" }} />

          {/* Section dividers */}
          <line x1={250} y1={0} x2={250} y2={265} stroke="#7a9cc0" strokeWidth={4} />
          <line x1={625} y1={0} x2={625} y2={260} stroke="#7a9cc0" strokeWidth={4} />

          {/* Bay doors - top (Bay 1 & 2 only, pull-through) */}
          {[[250, 94], [344, 93]].map(([bx, bw], i) => (
            <rect key={`top-${i}`} x={bx + 12} y={-2} width={bw - 24} height={5}
              fill="none" stroke="#6b8aaa" strokeWidth={1.5} rx={2} strokeDasharray="4,2" />
          ))}

          {/* Bay doors - bottom (all 4) */}
          {[[250, 94], [344, 93], [437, 94], [531, 94]].map(([bx, bw], i) => (
            <rect key={`bot-${i}`} x={bx + 12} y={257} width={bw - 24} height={5}
              fill="none" stroke="#6b8aaa" strokeWidth={1.5} rx={2} strokeDasharray="4,2" />
          ))}

          {/* Divider between Daily Supply and bays 3 & 4 */}
          <line x1={437} y1={84} x2={625} y2={84} stroke="#7a9cc0" strokeWidth={2} />

          {/* Flag plaza outline */}
          <rect x={870} y={262} width={55} height={32} fill="none" stroke="#3d4a5c"
            strokeWidth={1.5} rx={4} strokeDasharray="5,3" />

          {/* Context rooms */}
          {CTX_ROOMS.map((r, i) => (
            <g key={`ctx-${i}`}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h}
                fill={TYPE_COLORS._.f} stroke={TYPE_COLORS._.s} strokeWidth={0.8} rx={1} />
              <text x={r.x + r.w / 2} y={r.y + r.h / 2}
                fill="#4b5563" fontFamily="Inter,system-ui,sans-serif" fontWeight={500}
                textAnchor="middle" dominantBaseline="central"
                fontSize={r.w < 45 ? 5 : 6} style={{ pointerEvents: "none" }}>
                {r.name}
              </text>
            </g>
          ))}

          {/* Naming rooms */}
          {rooms.map((room) => {
            const { x, y, w, h } = room.coordinates;
            const status: RoomStatus = room.donation?.status ?? "available";
            const colors = status !== "available" ? STATUS_FILL[status] : TYPE_COLORS[room.type] || TYPE_COLORS._;
            const dimmed = dimmedFilter(room);
            const sn = shortenName(room.name);
            const sp = shortenPrice(room.price);
            const cx = x + w / 2;
            const cy = y + h / 2;
            const isVert = h > w * 2.5;
            const isHall = w > h * 5;

            return (
              <g key={room.id} className="cursor-pointer hover:brightness-150 transition-[filter]"
                opacity={dimmed ? 0.25 : 1}
                onClick={() => onRoomClick(room)}>
                <rect x={x} y={y} width={w} height={h}
                  fill={colors.f} stroke={colors.s} strokeWidth={1.5} rx={1} />

                {isVert ? (
                  <g transform={`translate(${cx},${cy}) rotate(-90)`}>
                    <text x={0} y={-4} fill="#e2e8f0" fontFamily="Inter,system-ui,sans-serif"
                      fontWeight={600} textAnchor="middle" dominantBaseline="central" fontSize={7}
                      style={{ pointerEvents: "none" }}>{sn}</text>
                    <text x={0} y={7} fill="#d4a44a" fontFamily="Inter,system-ui,sans-serif"
                      fontWeight={500} textAnchor="middle" dominantBaseline="central" fontSize={5.5}
                      style={{ pointerEvents: "none" }}>
                      {status !== "available" ? status.toUpperCase() : `$${sp}`}
                    </text>
                  </g>
                ) : isHall ? (
                  <text x={cx} y={cy} fill="#e2e8f0" fontFamily="Inter,system-ui,sans-serif"
                    fontWeight={600} textAnchor="middle" dominantBaseline="central" fontSize={5.5}
                    style={{ pointerEvents: "none" }}>
                    {sn} — {status !== "available" ? status.toUpperCase() : `$${sp}`}
                  </text>
                ) : (
                  <>
                    <text x={cx} y={cy - (w < 42 ? 3.6 : w < 55 ? 3.9 : w < 80 ? 4.6 : 5.5)}
                      fill="#e2e8f0" fontFamily="Inter,system-ui,sans-serif" fontWeight={600}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={w < 42 ? 5.5 : w < 55 ? 6 : w < 80 ? 7 : 8.5}
                      style={{ pointerEvents: "none" }}>{sn}</text>
                    <text x={cx} y={cy + (w < 42 ? 3.6 : w < 55 ? 3.9 : w < 80 ? 4.6 : 5.5) + 1}
                      fill={status !== "available" ? (status === "pledged" ? "#f0c040" : "#58d68d") : "#d4a44a"}
                      fontFamily="Inter,system-ui,sans-serif" fontWeight={500}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={w < 42 ? 4.5 : w < 55 ? 5 : w < 80 ? 6 : 7.5}
                      style={{ pointerEvents: "none" }}>
                      {status !== "available"
                        ? `${status.toUpperCase()}${room.donation?.donor_name ? ` - ${room.donation.donor_name}` : ""}`
                        : `$${sp}`}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Section labels */}
          {([
            ["L I V I N G   Q U A R T E R S", 125],
            ["A P P A R A T U S   B A Y", 437],
            ["A D M I N  /  O P S", 778],
          ] as [string, number][]).map(([label, lx]) => (
            <text key={label} x={lx} y={275} fill="#9ca3af"
              fontFamily="Georgia,serif" fontWeight="bold" textAnchor="middle"
              dominantBaseline="central" fontSize={9} letterSpacing={2}
              style={{ pointerEvents: "none" }}>
              {label}
            </text>
          ))}

          {/* Entrance marker */}
          <text x={900} y={258} fill="#4b5563" fontSize={5} textAnchor="middle"
            fontFamily="Inter,system-ui" style={{ pointerEvents: "none" }}>
            &#9650; ENTRANCE
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3.5 justify-center mt-3.5">
        {([
          ["Apparatus Bay", "bay"],
          ["Bunk Room", "bedroom"],
          ["Office", "office"],
          ["Common Area", "common"],
          ["Utility / Storage", "utility"],
        ] as [string, RoomType][]).map(([label, type]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
            <i className="w-3.5 h-3.5 rounded-sm border-2 inline-block"
              style={{ background: TYPE_COLORS[type].f, borderColor: TYPE_COLORS[type].s }} />
            {label}
          </span>
        ))}
      </div>
      <div className="text-center text-gray-500 text-xs mt-1.5">
        <span className="text-[#d4a44a]">40</span> rooms &middot;{" "}
        <span className="text-[#d4a44a]">$1.5M</span> room naming rights +{" "}
        <span className="text-[#d4a44a]">$500K</span> building naming rights ={" "}
        <span className="text-[#d4a44a]">$2M</span> campaign goal
      </div>
    </div>
  );
}

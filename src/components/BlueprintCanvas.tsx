"use client";

import { useState, useEffect } from "react";
import { RoomWithDonation, RoomStatus, RoomType } from "@/lib/types";
import { CONTACT_EMAIL, contactMailto } from "@/lib/constants";

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
  available: { f: "", s: "" },
  pledged: { f: "rgba(212,164,74,0.3)", s: "#d4a44a" },
  sold: { f: "rgba(16,185,129,0.3)", s: "#34d399" },
};

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

type Section = "all" | "living" | "bay" | "admin";

// The building occupies x 0..930, y 0..260 in plan units. Everything is drawn
// so that nothing crosses the outer wall: rooms are inset by ROOM_GAP on each
// side (leaving an even gutter between neighbours) and the wall is stroked
// entirely outside the building footprint.
const BUILDING_H = 260;
const WALL_T = 4;
const ROOM_GAP = 1;
const WALL_COLOR = "#7a9cc0";
const FLOOR_COLOR = "#172238";
const DOOR_COLOR = "#2c3f5e";
const FONT = "Inter,system-ui,sans-serif";

interface PlanView {
  x0: number;
  x1: number;
  viewBox: string;
  full: boolean;
}

const FULL_VIEW: PlanView = { x0: 0, x1: 930, viewBox: "-6 -6 942 304", full: true };

const SECTIONS: { id: Exclude<Section, "all">; label: string; view: PlanView }[] = [
  { id: "living", label: "Living Quarters", view: { x0: 0, x1: 250, viewBox: "-6 -6 262 272", full: false } },
  { id: "bay", label: "Apparatus Bay", view: { x0: 250, x1: 625, viewBox: "244 -6 387 272", full: false } },
  { id: "admin", label: "Admin / Ops", view: { x0: 625, x1: 930, viewBox: "619 -6 317 304", full: false } },
];

// Openings in the outer wall: [x, width]
const TOP_DOORS: [number, number][] = [[262, 70], [356, 69]];
const BOTTOM_DOORS: [number, number][] = [[262, 70], [356, 69], [449, 70], [543, 70], [888, 24]];

const SECTION_LABELS: [string, number][] = [
  ["LIVING QUARTERS", 125],
  ["APPARATUS BAY", 437.5],
  ["ADMIN / OPS", 777.5],
];

function shortenName(name: string): string {
  return name
    .replace("Apparatus ", "")
    .replace(" Room", "")
    .replace("Kitchen (West)", "Kitchen W")
    .replace("Oxygen ", "O₂ ")
    .replace("Mechanical", "Mech.")
    .replace("Office Supply", "Office Sup.")
    .replace("Daily Supply ", "D.Supply ");
}

function shortenPrice(price: number): string {
  const dollars = price / 100;
  if (dollars >= 1000) return `${dollars / 1000}K`;
  return `${dollars}`;
}

// Font size at which `text` fits in `avail` plan units, shrinking from `base`
// by at most `minScale`; null when it would have to shrink further than that.
function fitSize(text: string, base: number, avail: number, minScale = 0.75): number | null {
  const needed = text.length * base * 0.58;
  if (needed <= avail) return base;
  const scale = avail / needed;
  return scale >= minScale ? base * scale : null;
}

// First candidate that fits, else the last one squeezed to its minimum size.
function pickLabel(candidates: string[], base: number, avail: number, minScale = 0.75): { text: string; size: number } {
  for (const text of candidates) {
    const size = fitSize(text, base, avail, minScale);
    if (size) return { text, size };
  }
  const text = candidates[candidates.length - 1];
  return { text, size: fitSize(text, base, avail, 0) ?? base };
}

// Split at the space that leaves the two lines closest in length, without
// stranding a joining word ("&", "and") at the end of the first line.
function wrapTwoLines(text: string): [string, string] | null {
  let best: [string, string] | null = null;
  let bestScore = Infinity;
  for (let i = text.indexOf(" "); i !== -1; i = text.indexOf(" ", i + 1)) {
    const pair: [string, string] = [text.slice(0, i), text.slice(i + 1)];
    const dangling = /(^|\s)(&|and)$/i.test(pair[0]);
    const score = Math.max(pair[0].length, pair[1].length) + (dangling ? 4 : 0);
    if (score < bestScore) {
      best = pair;
      bestScore = score;
    }
  }
  return best;
}

// Lines to show under the room name for a pledged/sold room. The donor's name
// takes priority over the status word (colour already conveys status): it is
// wrapped onto two lines, then shrunk, before falling back to the status alone.
function donorLines(
  statusText: string,
  donor: string | undefined,
  base: number,
  availWidth: number,
  availHeight: number
): { lines: string[]; size: number } {
  const statusOnly = { lines: [statusText], size: fitSize(statusText, base, availWidth, 0) ?? base };
  if (!donor) return statusOnly;

  const wrapped = wrapTwoLines(donor);
  const twoLinesAt = (minScale: number) => {
    if (!wrapped) return null;
    const longer = wrapped[0].length >= wrapped[1].length ? wrapped[0] : wrapped[1];
    const size = fitSize(longer, base, availWidth, minScale);
    return size && size * 2 + 1 <= availHeight ? { lines: [...wrapped], size } : null;
  };
  const oneLineAt = (text: string, minScale: number) => {
    const size = fitSize(text, base, availWidth, minScale);
    return size ? { lines: [text], size } : null;
  };

  return (
    oneLineAt(`${statusText} · ${donor}`, 0.9) ??
    oneLineAt(donor, 0.9) ??
    twoLinesAt(0.9) ??
    oneLineAt(donor, 0.6) ??
    twoLinesAt(0.6) ??
    statusOnly
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function inView(rect: { x: number; w: number }, view: PlanView) {
  const center = rect.x + rect.w / 2;
  return center >= view.x0 && center < view.x1;
}

function PlanText({ x, y, size, fill, weight, rotate, children }: {
  x: number;
  y: number;
  size: number;
  fill: string;
  weight: number;
  rotate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <text x={x} y={y} fill={fill} fontFamily={FONT} fontWeight={weight} fontSize={size}
      textAnchor="middle" dominantBaseline="central"
      transform={rotate ? `rotate(-90 ${x} ${y})` : undefined}
      style={{ pointerEvents: "none" }}>
      {children}
    </text>
  );
}

// A door reads as a darker panel set into the wall, so the wall outline stays
// continuous.
function WallDoor({ x, w, y }: { x: number; w: number; y: number }) {
  return (
    <rect x={x} y={y + 0.8} width={w} height={WALL_T - 1.6} rx={0.6}
      fill={DOOR_COLOR} style={{ pointerEvents: "none" }} />
  );
}

function RoomLabel({ room, status }: { room: RoomWithDonation; status: RoomStatus }) {
  const { x, y, w, h } = room.coordinates;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const name = shortenName(room.name);
  const price = `$${shortenPrice(room.price)}`;
  const statusText = status.toUpperCase();
  const donor = room.donation?.donor_name;
  const subColor = status === "pledged" ? "#f0c040" : status === "sold" ? "#58d68d" : "#d4a44a";

  const isVert = h > w * 2.5;
  const isHall = w > h * 5;
  const avail = (isVert ? h : w) - 2 * ROOM_GAP - 4;

  if (isHall) {
    const tail = status === "available" ? [price] : donor ? [`${statusText} · ${donor}`, donor, statusText] : [statusText];
    const label = pickLabel(tail.map((t) => `${name} — ${t}`), 5.5, avail);
    return <PlanText x={cx} y={cy} size={label.size} fill="#e2e8f0" weight={600}>{label.text}</PlanText>;
  }

  const nameBase = w < 42 ? 5.5 : w < 55 ? 6 : w < 80 ? 7 : 8.5;
  const subBase = w < 42 ? 4.5 : w < 55 ? 5 : w < 80 ? 6 : 7.5;
  const nameLabel = pickLabel([name], nameBase, avail);
  const LINE_GAP = 1;
  const NAME_GAP = 2;
  const availHeight = (isVert ? w : h) - 2 * ROOM_GAP - 3 - nameLabel.size - NAME_GAP;
  const sub =
    status === "available"
      ? { lines: [price], size: fitSize(price, subBase, avail, 0) ?? subBase }
      : donorLines(statusText, donor, subBase, avail, availHeight);

  // Name plus sub-lines, centred as one block on the room's centre. Offsets
  // run down the page, or across it for rooms labelled vertically.
  const subHeight = sub.lines.length * sub.size + (sub.lines.length - 1) * LINE_GAP;
  const block = nameLabel.size + NAME_GAP + subHeight;
  const nameOffset = -block / 2 + nameLabel.size / 2;
  const subStart = -block / 2 + nameLabel.size + NAME_GAP + sub.size / 2;
  const at = (offset: number) => (isVert ? { x: cx + offset, y: cy } : { x: cx, y: cy + offset });

  return (
    <>
      <PlanText {...at(nameOffset)} size={nameLabel.size} fill="#e2e8f0" weight={600} rotate={isVert}>
        {nameLabel.text}
      </PlanText>
      {sub.lines.map((line, i) => (
        <PlanText key={i} {...at(subStart + i * (sub.size + LINE_GAP))} size={sub.size}
          fill={subColor} weight={500} rotate={isVert}>
          {line}
        </PlanText>
      ))}
    </>
  );
}

function FloorPlanSVG({
  view,
  rooms,
  dimmedFilter,
  onRoomClick,
  onBuildingClick,
  minWidth,
}: {
  view: PlanView;
  rooms: RoomWithDonation[];
  dimmedFilter: (room: RoomWithDonation) => boolean;
  onRoomClick: (room: RoomWithDonation) => void;
  onBuildingClick: () => void;
  minWidth?: string;
}) {
  const width = view.x1 - view.x0;
  const visibleRooms = view.full ? rooms : rooms.filter((r) => inView(r.coordinates, view));
  const ctxRooms = view.full ? CTX_ROOMS : CTX_ROOMS.filter((c) => inView(c, view));
  const doorVisible = ([dx, dw]: [number, number]) => dx >= view.x0 && dx + dw <= view.x1;

  return (
    <svg viewBox={view.viewBox} className="w-full h-auto block"
      style={minWidth ? { minWidth } : undefined}>
      {/* Floor */}
      <rect x={view.x0} y={0} width={width} height={BUILDING_H} fill={FLOOR_COLOR} />

      {/* Outer wall, stroked wholly outside the footprint */}
      <rect x={view.x0 - WALL_T / 2} y={-WALL_T / 2} width={width + WALL_T} height={BUILDING_H + WALL_T}
        fill="none" stroke={WALL_COLOR} strokeWidth={WALL_T} rx={WALL_T / 2}
        style={{ pointerEvents: "none" }} />
      {view.full && (
        <rect x={view.x0 - WALL_T / 2} y={-WALL_T / 2} width={width + WALL_T} height={BUILDING_H + WALL_T}
          fill="none" stroke="transparent" strokeWidth={WALL_T * 2.5}
          style={{ cursor: "pointer", pointerEvents: "stroke" }}
          onClick={onBuildingClick}>
          <title>Building Naming Rights</title>
        </rect>
      )}

      {/* Bay doors and entrance */}
      {TOP_DOORS.filter(doorVisible).map(([dx, dw]) => (
        <WallDoor key={`top-${dx}`} x={dx} w={dw} y={-WALL_T} />
      ))}
      {BOTTOM_DOORS.filter(doorVisible).map(([dx, dw]) => (
        <WallDoor key={`bot-${dx}`} x={dx} w={dw} y={BUILDING_H} />
      ))}

      {/* Context rooms (not nameable) */}
      {ctxRooms.map((r, i) => {
        const vertical = r.h > r.w * 2.5;
        const size = fitSize(r.name, 5, (vertical ? r.h : r.w) - 2 * ROOM_GAP - 2);
        return (
          <g key={`ctx-${i}`}>
            <rect x={r.x + ROOM_GAP} y={r.y + ROOM_GAP} width={r.w - 2 * ROOM_GAP} height={r.h - 2 * ROOM_GAP}
              fill="rgba(255,255,255,0.025)" stroke="rgba(122,156,192,0.16)" strokeWidth={0.6} rx={1.5} />
            {size && (
              <PlanText x={r.x + r.w / 2} y={r.y + r.h / 2} size={size} fill="#5b6679" weight={500} rotate={vertical}>
                {r.name}
              </PlanText>
            )}
          </g>
        );
      })}

      {/* Nameable rooms */}
      {visibleRooms.map((room) => {
        const { x, y, w, h } = room.coordinates;
        const status: RoomStatus = room.donation?.status ?? "available";
        const colors = status !== "available" ? STATUS_FILL[status] : TYPE_COLORS[room.type] || TYPE_COLORS._;

        return (
          <g key={room.id} className="cursor-pointer hover:brightness-150 transition-[filter]"
            opacity={dimmedFilter(room) ? 0.25 : 1}
            onClick={() => onRoomClick(room)}>
            <rect x={x + ROOM_GAP} y={y + ROOM_GAP} width={w - 2 * ROOM_GAP} height={h - 2 * ROOM_GAP}
              fill={colors.f} stroke={colors.s} strokeWidth={1} rx={1.5} />
            <RoomLabel room={room} status={status} />
          </g>
        );
      })}

      {view.full && (
        <>
          {/* Walls between the three sections */}
          {[250, 625].map((wx) => (
            <line key={wx} x1={wx} y1={0} x2={wx} y2={BUILDING_H}
              stroke={WALL_COLOR} strokeWidth={1} style={{ pointerEvents: "none" }} />
          ))}

          {SECTION_LABELS.map(([label, lx]) => (
            <text key={label} x={lx} y={279} fill="#8b98ad" fontFamily={FONT} fontWeight={600}
              textAnchor="middle" dominantBaseline="central" fontSize={7.5} letterSpacing={3}
              style={{ pointerEvents: "none" }}>
              {label}
            </text>
          ))}
        </>
      )}
    </svg>
  );
}

export function BlueprintCanvas({
  rooms,
  dimmedFilter,
  onRoomClick,
}: BlueprintCanvasProps) {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<Section>("all");

  const handleBuildingClick = () => {
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
  };

  // Desktop: full plan
  if (!isMobile) {
    return (
      <div className="flex-1 px-4 sm:px-6 py-5 overflow-auto">
        <div className="w-full max-w-[1500px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-gray-400 text-sm">
              Select any space on the floor plan to view its naming opportunity.
            </p>
            <BuildingButton onClick={handleBuildingClick} />
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="blueprint-grid p-3 lg:p-6 overflow-x-auto">
              <FloorPlanSVG
                view={FULL_VIEW}
                rooms={rooms}
                dimmedFilter={dimmedFilter}
                onRoomClick={onRoomClick}
                onBuildingClick={handleBuildingClick}
                minWidth="680px"
              />
            </div>
            <Legend />
          </div>

          <Footer />
        </div>
      </div>
    );
  }

  // Mobile: section selector + zoomed view
  const currentSection = SECTIONS.find((sec) => sec.id === activeSection);

  return (
    <div className="flex-1 p-3 overflow-auto">
      {/* Section selector buttons */}
      <div className="flex gap-2 mb-3">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(activeSection === section.id ? "all" : section.id)}
            className={`flex-1 py-3 px-2 rounded-lg text-sm font-serif font-bold border transition-colors ${
              activeSection === section.id
                ? "bg-gold border-gold text-background"
                : "bg-surface text-gray-200 border-border"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <BuildingButton onClick={handleBuildingClick} fullWidth />

      <p className="text-gray-400 text-xs text-center my-3">
        Pick a section to zoom in, then tap a space for details.
      </p>

      {/* Zoomed section or full overview */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="blueprint-grid p-3">
          <FloorPlanSVG
            view={currentSection ? currentSection.view : FULL_VIEW}
            rooms={rooms}
            dimmedFilter={dimmedFilter}
            onRoomClick={onRoomClick}
            onBuildingClick={handleBuildingClick}
          />
        </div>
        <Legend />
      </div>

      <Footer />
    </div>
  );
}

function BuildingButton({ onClick, fullWidth }: { onClick: () => void; fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`${fullWidth ? "w-full justify-center" : ""} inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold font-serif font-bold hover:bg-gold/20 transition-colors`}
    >
      Building Naming Rights
      <span className="font-sans font-semibold tabular-nums">$500,000</span>
    </button>
  );
}

function Legend() {
  return (
    <div className="bg-surface border-t border-border px-4 py-3 flex flex-wrap gap-x-4 gap-y-2 justify-center">
      {([
        ["Apparatus Bay", "bay"],
        ["Bunk Room", "bedroom"],
        ["Office", "office"],
        ["Common Area", "common"],
        ["Utility / Storage", "utility"],
      ] as [string, RoomType][]).map(([label, type]) => (
        <LegendItem key={type} label={label} colors={TYPE_COLORS[type]} />
      ))}
      <span className="hidden sm:block w-px self-stretch bg-border" />
      <LegendItem label="Pledged" colors={STATUS_FILL.pledged} />
      <LegendItem label="Sold" colors={STATUS_FILL.sold} />
    </div>
  );
}

function LegendItem({ label, colors }: { label: string; colors: { f: string; s: string } }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-300">
      <i className="w-3.5 h-3.5 rounded-sm border-2 inline-block"
        style={{ background: colors.f, borderColor: colors.s }} />
      {label}
    </span>
  );
}

function Footer() {
  return (
    <div className="mt-4 text-center space-y-1.5">
      <p className="text-gray-300 text-sm">
        Interested in naming a space?{" "}
        <a href={contactMailto("Naming rights inquiry")} title={`Email ${CONTACT_EMAIL}`}
          className="text-gold font-semibold underline underline-offset-4 decoration-gold/40 hover:decoration-gold whitespace-nowrap">
          Campaign Contact
        </a>
      </p>
      <p className="text-gray-500 text-xs">
        <span className="text-gold">40</span> rooms &middot;{" "}
        <span className="text-gold">$1.5M</span> room naming rights +{" "}
        <span className="text-gold">$500K</span> building naming rights ={" "}
        <span className="text-gold">$2M</span> campaign goal
      </p>
    </div>
  );
}

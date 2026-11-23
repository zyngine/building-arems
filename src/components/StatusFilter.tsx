"use client";

import { RoomStatus } from "@/lib/types";

type FilterValue = "all" | RoomStatus;

interface StatusFilterProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
  counts: Record<FilterValue, number>;
}

const FILTERS: { value: FilterValue; label: string; dot?: string }[] = [
  { value: "all", label: "All Spaces" },
  { value: "available", label: "Available", dot: "#5dade2" },
  { value: "pledged", label: "Pledged", dot: "#f0c040" },
  { value: "sold", label: "Sold", dot: "#58d68d" },
];

export function StatusFilter({ active, onChange, counts }: StatusFilterProps) {
  return (
    <div className="bg-[#0d1117] border-b border-border">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const isActive = active === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onChange(f.value)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white/10 border-white/25 text-white"
                  : "bg-transparent border-border text-gray-400 hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              {f.dot && (
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: f.dot }}
                />
              )}
              {f.label}
              <span
                className={`tabular-nums ${isActive ? "text-gray-300" : "text-gray-500"}`}
              >
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

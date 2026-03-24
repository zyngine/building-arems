"use client";

import { RoomStatus } from "@/lib/types";

type FilterValue = "all" | RoomStatus;

interface StatusFilterProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "pledged", label: "Pledged" },
  { value: "sold", label: "Sold" },
];

export function StatusFilter({ active, onChange }: StatusFilterProps) {
  return (
    <div className="px-5 py-2 flex gap-2 bg-[#0d1117] border-b border-border overflow-x-auto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            active === f.value
              ? "bg-border text-white"
              : "bg-transparent text-gray-500 border border-border hover:text-gray-300"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

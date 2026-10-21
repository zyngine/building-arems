"use client";

import { formatCurrency } from "@/lib/utils";

interface CampaignStatsProps {
  campaignName: string;
  totalRaised: number;
  goal: number;
  progress: number;
  available: number;
  pledged: number;
  sold: number;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  onEditTotal: () => void;
}

export function CampaignStats({
  campaignName,
  totalRaised,
  goal,
  progress,
  available,
  pledged,
  sold,
  isAdmin,
  onAdminClick,
  onLogout,
  onEditTotal,
}: CampaignStatsProps) {
  return (
    <div>
      <div className="bg-surface px-5 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-gold font-serif text-lg font-bold">
            {campaignName}
          </span>
          <span className="text-gray-400 text-sm flex items-center gap-1.5">
            Total Raised:{" "}
            <span className="text-green-400 font-bold">
              {formatCurrency(totalRaised)}
            </span>
            {isAdmin && (
              <button
                onClick={onEditTotal}
                title="Adjust total raised"
                aria-label="Adjust total raised"
                className="text-gray-500 hover:text-gold transition-colors text-xs border border-border rounded px-1.5 py-0.5"
              >
                Edit
              </button>
            )}
          </span>
          {goal > 0 && (
            <span className="text-gray-400 text-sm">
              Goal:{" "}
              <span className="text-gold font-bold">
                {formatCurrency(goal)}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-room-bay inline-block" />
              {available} Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gold-dark inline-block" />
              {pledged} Pledged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-sold inline-block" />
              {sold} Sold
            </span>
          </div>
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 border border-border px-3 py-1 rounded hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-xs text-gray-400 border border-border px-3 py-1 rounded hover:border-gold hover:text-gold transition-colors"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>

      <div className="h-[3px] bg-border">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #0e6b3a, #d4a44a)",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { formatCurrency } from "@/lib/utils";

interface CampaignStatsProps {
  campaignName: string;
  totalRaised: number;
  goal: number;
  progress: number;
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
  isAdmin,
  onAdminClick,
  onLogout,
  onEditTotal,
}: CampaignStatsProps) {
  const percent = Math.round(progress);

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-x-4 lg:gap-x-10 gap-y-4">
        <div className="order-1 min-w-0 flex-1 lg:flex-none">
          <div className="text-gray-400 text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
            Building Naming Rights
          </div>
          <h1 className="text-gold font-serif text-lg sm:text-2xl font-bold leading-tight">
            {campaignName}
          </h1>
        </div>

        <div className="order-2 shrink-0 lg:order-3">
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 border border-border px-3 py-1.5 rounded-md hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onAdminClick}
              className="text-xs text-gray-400 border border-border px-3 py-1.5 rounded-md hover:border-gold hover:text-gold transition-colors"
            >
              Admin Login
            </button>
          )}
        </div>

        <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1 min-w-0">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-white text-2xl sm:text-3xl font-bold tabular-nums leading-none">
                {formatCurrency(totalRaised)}
              </span>
              <span className="text-gray-400 text-sm">
                raised
                {goal > 0 && (
                  <>
                    {" "}of{" "}
                    <span className="text-gold font-semibold tabular-nums">
                      {formatCurrency(goal)}
                    </span>{" "}
                    goal
                  </>
                )}
              </span>
              {isAdmin && (
                <button
                  onClick={onEditTotal}
                  title="Adjust total raised"
                  aria-label="Adjust total raised"
                  className="text-gray-400 hover:text-gold hover:border-gold transition-colors text-xs border border-border rounded px-2 py-0.5"
                >
                  Edit
                </button>
              )}
            </div>
            {goal > 0 && (
              <span className="text-emerald-400 text-sm sm:text-base font-bold tabular-nums leading-none">
                {percent}%
              </span>
            )}
          </div>

          {goal > 0 && (
            <div
              className="mt-2.5 h-2.5 rounded-full bg-border overflow-hidden"
              role="progressbar"
              aria-label="Campaign progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #10b981, #d4a44a)",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

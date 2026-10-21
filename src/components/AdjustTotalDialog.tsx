"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "./Toast";

interface AdjustTotalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomsRaised: number; // cents, auto-summed from room donations
  currentAdjustment: number; // cents
  settingsId: string | null;
  onSaved: (cents: number) => void;
}

export function AdjustTotalDialog({
  isOpen,
  onClose,
  roomsRaised,
  currentAdjustment,
  settingsId,
  onSaved,
}: AdjustTotalDialogProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState(
    currentAdjustment ? (currentAdjustment / 100).toString() : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const parsed = amount.trim() === "" ? 0 : parseFloat(amount);
  const isValid = !Number.isNaN(parsed);
  const adjustmentCents = isValid ? Math.round(parsed * 100) : 0;
  const projectedTotal = roomsRaised + adjustmentCents;

  const handleSave = async () => {
    if (!isValid) {
      showToast("Enter a valid dollar amount", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/campaign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: settingsId,
          manual_adjustment: adjustmentCents,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      onSaved(adjustmentCents);
      showToast("Total adjustment saved");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2.5 bg-[#0d1117] border border-border rounded-md text-white text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "text-gray-400 text-[11px] uppercase tracking-wider";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl border border-border max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 pb-4 text-center border-b border-border">
          <div className="text-gold font-serif text-lg font-bold">
            Adjust Total Raised
          </div>
          <p className="text-gray-500 text-sm mt-1 px-6">
            Add offline or other donations on top of the room total.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-400">Room donations</span>
            <span className="text-white font-medium">
              {formatCurrency(roomsRaised)}
            </span>
          </div>

          <label className={labelClass}>Other / Offline Donations ($)</label>
          <input
            className={inputClass}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
          />
          <p className="text-gray-600 text-[11px] mt-1.5">
            Use a negative amount to subtract. This does not change any room.
          </p>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            <span className="text-gray-400 text-sm">New total raised</span>
            <span className="text-green-400 font-bold text-lg">
              {formatCurrency(projectedTotal)}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !isValid}
            className="flex-1 py-3 bg-gold text-background font-bold rounded-md text-sm hover:bg-gold/90 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-3 text-gray-400 border border-border rounded-md text-sm hover:text-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

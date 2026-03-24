"use client";

import { useState } from "react";
import { RoomWithDonation, DonationStatus, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "./Toast";

interface RoomFormProps {
  room: RoomWithDonation;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "credit", label: "Credit" },
  { value: "pledge_card", label: "Pledge Card" },
  { value: "other", label: "Other" },
];

export function RoomForm({ room, onClose }: RoomFormProps) {
  const { showToast } = useToast();
  const d = room.donation;

  const [donorName, setDonorName] = useState(d?.donor_name ?? "");
  const [dedicationText, setDedicationText] = useState(d?.dedication_text ?? "");
  const [phone, setPhone] = useState(d?.donor_phone ?? "");
  const [email, setEmail] = useState(d?.donor_email ?? "");
  const [address, setAddress] = useState(d?.donor_address ?? "");
  const [status, setStatus] = useState<DonationStatus | "available">(
    d?.status ?? "available"
  );
  const [pledgeAmount, setPledgeAmount] = useState(
    d?.pledge_amount ? (d.pledge_amount / 100).toString() : (room.price / 100).toString()
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    d?.payment_method ?? ""
  );
  const [notes, setNotes] = useState(d?.internal_notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!donorName.trim()) {
      showToast("Donor name is required", "error");
      return;
    }
    if (status === "available") {
      showToast("Select a status (Pledged or Sold)", "error");
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        ...(d ? { id: d.id } : {}),
        room_id: room.id,
        donor_name: donorName.trim(),
        dedication_text: dedicationText.trim() || null,
        status,
        donor_phone: phone.trim() || null,
        donor_email: email.trim() || null,
        donor_address: address.trim() || null,
        pledge_amount: pledgeAmount ? Math.round(parseFloat(pledgeAmount) * 100) : null,
        payment_method: paymentMethod || null,
        internal_notes: notes.trim() || null,
      };

      const res = await fetch("/api/donations", {
        method: d ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      showToast("Donation saved successfully");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!d) return;
    if (!window.confirm("Are you sure you want to clear this donation? This will reset the room to available.")) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/donations?id=${d.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to clear donation");
      }

      showToast("Room reset to available");
      onClose();
    } catch {
      showToast("Failed to clear donation", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full mt-1 px-3 py-2.5 bg-[#0d1117] border border-border rounded-md text-white text-sm focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass = "text-gray-400 text-[11px] uppercase tracking-wider";

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <div className="text-center py-3 mb-4 border-b border-border">
        <div className="text-gold font-serif text-2xl font-bold">
          {formatCurrency(room.price)}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gold text-[10px] uppercase tracking-widest font-bold mb-3">
          Donor Information
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Donor Name *</label>
          <input
            className={inputClass}
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Name of donor or family"
          />
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Dedication Text</label>
          <textarea
            className={`${inputClass} min-h-[60px] resize-none`}
            value={dedicationText}
            onChange={(e) => setDedicationText(e.target.value)}
            placeholder="In memory of... / In honor of..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(717) 555-0142"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="donor@email.com"
            />
          </div>
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Mailing Address</label>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Gettysburg, PA 17325"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gold text-[10px] uppercase tracking-widest font-bold mb-3">
          Payment Details
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={`${inputClass} appearance-none`}
              value={status}
              onChange={(e) => setStatus(e.target.value as DonationStatus | "available")}
            >
              <option value="available">Available</option>
              <option value="pledged">Pledged</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Pledge Amount</label>
            <input
              className={inputClass}
              type="number"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              placeholder={`${room.price / 100}`}
            />
          </div>
        </div>

        <div className="mb-2.5">
          <label className={labelClass}>Payment Method</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() =>
                  setPaymentMethod(paymentMethod === m.value ? "" : m.value)
                }
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  paymentMethod === m.value
                    ? "bg-border border border-gold text-gold"
                    : "bg-[#0d1117] border border-border text-gray-500 hover:text-gray-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>
          Internal Notes{" "}
          <span className="text-gray-600 italic normal-case">(admin only)</span>
        </label>
        <textarea
          className={`${inputClass} min-h-[60px] resize-none`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Private notes..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-gold text-background font-bold rounded-md text-sm hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {d && (
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="px-4 py-3 text-red-400 border border-red-900 rounded-md text-sm hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

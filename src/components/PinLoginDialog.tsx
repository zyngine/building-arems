"use client";

import { useState } from "react";

interface PinLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
}

const MAX_DIGITS = 6;

export function PinLoginDialog({ isOpen, onClose, onSubmit }: PinLoginDialogProps) {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDigit = async (d: string) => {
    if (isSubmitting) return;
    setError(false);
    const next = digits + d;
    setDigits(next);

    if (next.length === MAX_DIGITS) {
      setIsSubmitting(true);
      const success = await onSubmit(next);
      if (success) {
        setDigits("");
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setDigits("");
          setError(false);
        }, 600);
      }
      setIsSubmitting(false);
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setDigits("");
    setError(false);
  };

  const handleClose = () => {
    setDigits("");
    setError(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className={`bg-surface rounded-xl border border-border max-w-xs w-full mx-4 ${error ? "animate-shake" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 pb-4 text-center">
          <div className="text-gold font-serif text-lg font-bold">
            Admin Access
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {error ? "Invalid PIN" : "Enter PIN to continue"}
          </p>
        </div>

        <div className="flex justify-center gap-3 pb-5">
          {Array.from({ length: MAX_DIGITS }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-colors ${
                i < digits.length
                  ? "bg-gold"
                  : "border-2 border-border"
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-4 bg-border rounded-lg text-white text-xl font-bold hover:bg-gray-600 active:bg-gray-500 transition-colors"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-4 rounded-lg text-red-400 text-sm hover:text-red-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => handleDigit("0")}
              className="py-4 bg-border rounded-lg text-white text-xl font-bold hover:bg-gray-600 active:bg-gray-500 transition-colors"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-4 rounded-lg text-gray-500 text-lg hover:text-gray-300 transition-colors"
            >
              &#9003;
            </button>
          </div>
        </div>

        <div className="pb-4 text-center">
          <button
            onClick={handleClose}
            className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

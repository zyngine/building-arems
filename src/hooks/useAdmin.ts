"use client";

import { useState, useEffect } from "react";
import { setAdminToken, clearAdminToken, adminFetch } from "@/lib/adminAuth";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate an existing session (bearer token if we have one, else cookie).
    adminFetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) setAdminToken(data.token);
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await adminFetch("/api/auth/logout", { method: "POST" });
    clearAdminToken();
    setIsAdmin(false);
  };

  return { isAdmin, isLoading, login, logout };
}

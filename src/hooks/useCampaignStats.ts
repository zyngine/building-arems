"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { CampaignSettings, RoomWithDonation } from "@/lib/types";

export function useCampaignStats(rooms: RoomWithDonation[]) {
  const [settings, setSettings] = useState<CampaignSettings | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("campaign_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as CampaignSettings);
      });
  }, []);

  // Apply a new manual adjustment (cents) locally after it is saved, so the
  // total updates immediately without a refetch.
  const applyManualAdjustment = useCallback((cents: number) => {
    setSettings((prev) =>
      prev ? { ...prev, manual_adjustment: cents } : prev
    );
  }, []);

  const stats = useMemo(() => {
    const available = rooms.filter(
      (r) => !r.donation && r.type !== "corridor"
    ).length;
    const pledged = rooms.filter(
      (r) => r.donation?.status === "pledged"
    ).length;
    const sold = rooms.filter(
      (r) => r.donation?.status === "sold"
    ).length;

    const roomsRaised = rooms.reduce((sum, room) => {
      if (!room.donation) return sum;
      return sum + (room.donation.pledge_amount ?? room.price);
    }, 0);

    const manualAdjustment = settings?.manual_adjustment ?? 0;
    const totalRaised = roomsRaised + manualAdjustment;

    const goal = settings?.campaign_goal ?? 0;
    const progress = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

    return {
      available,
      pledged,
      sold,
      roomsRaised,
      manualAdjustment,
      totalRaised,
      goal,
      progress,
      campaignName: settings?.campaign_name ?? "Capital Campaign",
      settingsId: settings?.id ?? null,
    };
  }, [rooms, settings]);

  return { ...stats, applyManualAdjustment };
}

"use client";

import { useState, useEffect, useMemo } from "react";
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

    const totalRaised = rooms.reduce((sum, room) => {
      if (!room.donation) return sum;
      return sum + (room.donation.pledge_amount ?? room.price);
    }, 0);

    const goal = settings?.campaign_goal ?? 0;
    const progress = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

    return {
      available,
      pledged,
      sold,
      totalRaised,
      goal,
      progress,
      campaignName: settings?.campaign_name ?? "Capital Campaign",
    };
  }, [rooms, settings]);

  return stats;
}

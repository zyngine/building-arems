"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Room, Donation, RoomWithDonation } from "@/lib/types";

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function fetchData() {
      const [roomsRes, donationsRes] = await Promise.all([
        supabase.from("rooms").select("*").order("sort_order"),
        supabase.from("donations").select("*"),
      ]);

      const roomsData = (roomsRes.data || []) as Room[];
      const donationsData = (donationsRes.data || []) as Donation[];

      const donationsByRoom = new Map(
        donationsData.map((d) => [d.room_id, d])
      );

      setRooms(
        roomsData.map((room) => ({
          ...room,
          donation: donationsByRoom.get(room.id) || null,
        }))
      );
      setIsLoading(false);
    }

    fetchData();

    const channel = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          setRooms((prev) => {
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id: string; room_id: string };
              return prev.map((room) =>
                room.id === old.room_id
                  ? { ...room, donation: null }
                  : room
              );
            }

            const donation = payload.new as Donation;
            return prev.map((room) =>
              room.id === donation.room_id
                ? { ...room, donation }
                : room
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { rooms, isLoading };
}

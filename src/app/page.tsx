"use client";

import { useState } from "react";
import { RoomWithDonation, RoomStatus } from "@/lib/types";
import { useRooms } from "@/hooks/useRooms";
import { useAdmin } from "@/hooks/useAdmin";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { CampaignStats } from "@/components/CampaignStats";
import { StatusFilter } from "@/components/StatusFilter";
import { BlueprintCanvas } from "@/components/BlueprintCanvas";
import { RoomModal } from "@/components/RoomModal";
import { PinLoginDialog } from "@/components/PinLoginDialog";

type FilterValue = "all" | RoomStatus;

export default function Home() {
  const { rooms, isLoading } = useRooms();
  const { isAdmin, login, logout } = useAdmin();
  const stats = useCampaignStats(rooms);

  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomWithDonation | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const dimmedFilter = (room: RoomWithDonation): boolean => {
    if (filter === "all") return false;
    const roomStatus: RoomStatus = room.donation?.status ?? "available";
    return roomStatus !== filter;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CampaignStats
        campaignName={stats.campaignName}
        totalRaised={stats.totalRaised}
        goal={stats.goal}
        progress={stats.progress}
        available={stats.available}
        pledged={stats.pledged}
        sold={stats.sold}
        isAdmin={isAdmin}
        onAdminClick={() => setShowPinDialog(true)}
        onLogout={logout}
      />

      <StatusFilter active={filter} onChange={setFilter} />

      <BlueprintCanvas
        rooms={rooms}
        dimmedFilter={dimmedFilter}
        onRoomClick={setSelectedRoom}
      />

      <RoomModal
        room={selectedRoom}
        isAdmin={isAdmin}
        onClose={() => setSelectedRoom(null)}
      />

      <PinLoginDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSubmit={login}
      />
    </div>
  );
}

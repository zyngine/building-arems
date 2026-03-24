import { RoomType, RoomStatus } from "./types";

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  bay: "#1a5276",
  office: "#2c3e7a",
  common: "#6c3483",
  utility: "#5d4e60",
  bedroom: "#1a5c5c",
  corridor: "#3a3a3a",
};

const STATUS_COLORS: Record<RoomStatus, string> = {
  available: "#1a5276",
  pledged: "#7d5a0b",
  sold: "#0e6b3a",
};

export function getRoomColor(type: RoomType, status: RoomStatus): string {
  if (status !== "available") return STATUS_COLORS[status];
  return ROOM_TYPE_COLORS[type];
}

export function getStatusLabel(status: RoomStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusTextColor(status: RoomStatus): string {
  switch (status) {
    case "available": return "#5dade2";
    case "pledged": return "#f0c040";
    case "sold": return "#58d68d";
  }
}

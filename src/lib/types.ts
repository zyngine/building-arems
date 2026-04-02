export type RoomType = "bay" | "office" | "common" | "utility" | "bedroom" | "corridor";

export type DonationStatus = "pledged" | "sold";

export type PaymentMethod = "cash" | "check" | "credit" | "pledge_card" | "other";

export type RoomStatus = "available" | DonationStatus;

export interface RoomCoordinates {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  type: RoomType;
  description: string | null;
  price: number;
  coordinates: RoomCoordinates;
  sort_order: number;
  created_at: string;
}

export interface Donation {
  id: string;
  room_id: string;
  donor_name: string;
  dedication_text: string | null;
  status: DonationStatus;
  donor_phone: string | null;
  donor_email: string | null;
  donor_address: string | null;
  pledge_amount: number | null;
  payment_method: PaymentMethod | null;
  internal_notes: string | null;
  donated_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface CampaignSettings {
  id: string;
  campaign_name: string;
  campaign_goal: number | null;
  is_active: boolean;
  updated_at: string;
}

export interface RoomWithDonation extends Room {
  donation: Donation | null;
}

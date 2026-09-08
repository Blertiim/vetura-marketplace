export type Country = {
  id: number;
  code: string;
  name: string;
};

export type City = {
  id: number;
  country_id: number;
  name: string;
};

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price_amount: number;
  price_unit: "day" | "week";
  city_id: number;
  description: string | null;
  mileage_km: number | null;
  condition: string | null;
  transmission: "manuale" | "automatike" | null;
  fuel_type: "benzinë" | "dizel" | "hibrid" | "elektrike" | "gaz" | null;
  color: string | null;
  body_type: string | null;
  status: "active" | "paused" | "deleted";
  created_at: string;
};

// Vetëm kolonat qi i nevojiten kartelës n'ballinë (shifni page.tsx — atje
// pyetja Supabase merr veç këto kolona, jo krejt "Listing", për me qenë
// faqja ma e shpejtë).
export type ListingSummary = Pick<
  Listing,
  | "id"
  | "owner_id"
  | "title"
  | "brand"
  | "model"
  | "year"
  | "price_amount"
  | "price_unit"
  | "city_id"
  | "status"
  | "created_at"
>;

export const BODY_TYPES = [
  "Veturë e vogël",
  "Sedan",
  "Hatchback",
  "Universal",
  "Kupe",
  "Kabriolet",
  "SUV",
  "Minivan",
] as const;

export const CAR_COLORS = [
  "E bardhë",
  "E zezë",
  "Gri",
  "Argjend",
  "Kuqe",
  "Blu",
  "Kaltërt",
  "Jeshile",
  "Verdhë",
  "Portokalli",
  "Kafe",
  "Vjollcë",
] as const;

export type ListingPhoto = {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
};

export type ListingAvailability = {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_premium: boolean;
};

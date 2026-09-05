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
  status: "active" | "paused" | "deleted";
  created_at: string;
};

export type ListingPhoto = {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
};

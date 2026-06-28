export type UserRole = 'farmer' | 'driver' | 'courier' | 'buyer' | 'admin'
export type DriverRole = 'long_haul' | 'courier'
export type TripStatus = 'pending' | 'accepted' | 'in_transit' | 'arrived_hub' | 'delivered' | 'settled' | 'disputed'
export type InventoryStatus = 'pending_confirmation' | 'available' | 'reserved' | 'sold' | 'expired' | 'disputed'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'disbursed' | 'disputed'
export type Millimes = number

export function formatTND(millimes: Millimes): string {
  return (millimes / 1000).toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }) + ' TND'
}

export interface AIListingExtraction {
  product_name: string
  quantity: number
  unit: 'kg' | 'hara' | 'litra' | 'crate' | 'piece' | 'ton'
  location_name: string
  asking_price_tnd: number | null
  harvest_date: string | null
  notes: string | null
  confidence_score: number
}

export interface LocationPing {
  driver_id: string
  trip_id: string
  lat: number
  lng: number
  timestamp: string
}

export interface FarmerProfile {
  id: string
  whatsapp_id: string
  phone: string
  name: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface DriverProfile {
  id: string
  user_id: string
  phone: string
  name: string
  cin_photo_url: string | null
  vehicle_plate: string
  carte_grise_url: string | null
  vehicle_type: string
  role: DriverRole
  trust_tier: 1 | 2 | 3
  trust_score: number
  total_trips: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  farmer_id: string
  product_name: string
  product_category: string
  quantity: number
  unit: string
  location_name: string
  asking_price_millimes: Millimes | null
  platform_price_millimes: Millimes | null
  harvest_date: string | null
  shelf_life_days: number | null
  notes: string | null
  status: InventoryStatus
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  inventory_item_id: string
  farmer_id: string
  driver_id: string | null
  buyer_id: string | null
  status: TripStatus
  origin_location_name: string
  destination_location_name: string | null
  pickup_otp_hash: string | null
  delivery_otp_hash: string | null
  pickup_otp_attempts: number
  delivery_otp_attempts: number
  pickup_confirmed_at: string | null
  delivery_confirmed_at: string | null
  hub_arrived_at: string | null
  last_ping_at: string | null
  payout_millimes: Millimes | null
  commission_millimes: Millimes | null
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  trip_id: string | null
  status: string
  total_millimes: Millimes
  commission_millimes: Millimes
  delivery_zone: string | null
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export type RatingTarget = 'driver' | 'farmer' | 'product'

export interface Rating {
  id: number
  order_id: string
  trip_id: string | null
  reviewer_id: string
  target_id: string
  target_type: RatingTarget
  score: 1 | 2 | 3 | 4 | 5
  review_text: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  inventory_item_id: string
  quantity: number
  unit_price_millimes: Millimes
}

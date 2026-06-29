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
  image_url: string | null
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
  status: string
  total_price_millimes: Millimes
  commission_millimes: Millimes
  delivery_zone_id: string | null
  delivery_address: string | null
  delivery_notes: string | null
  is_recurring: boolean
  recurrence_day: number | null
  recurrence_interval: 'weekly' | 'biweekly' | 'monthly' | null
  next_recurrence_at: string | null
  original_order_id: string | null
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
  total_millimes: Millimes
}

export type SubTripStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'settled' | 'disputed'

export interface SubTrip {
  id: string
  parent_trip_id: string
  courier_id: string | null
  delivery_zone_id: string | null
  status: SubTripStatus
  otp_delivery: string | null
  cargo_value_millimes: Millimes
  driver_fee_millimes: Millimes
  pickup_location_name: string
  delivery_location_name: string
  delivery_address: string | null
  order_ids: string[]
  created_at: string
  accepted_at: string | null
  delivered_at: string | null
  settled_at: string | null
}

export interface DeliveryZone {
  id: string
  hub_id: string
  name: string
  boundary: Record<string, unknown>
  is_active: boolean
}

export type GroupBuyStatus = 'open' | 'fulfilled' | 'cancelled'

export interface GroupBuy {
  id: string
  creator_id: string
  inventory_item_id: number
  target_quantity: number
  current_quantity: number
  unit: string
  unit_price_millimes: Millimes
  status: GroupBuyStatus
  expires_at: string
  created_at: string
  fulfilled_at: string | null
  cancelled_at: string | null
}

export interface GroupBuyWithItem extends Omit<GroupBuy, 'inventory_item_id'> {
  inventory_item_id: number
  product_name: string
  product_category: string
  creator_name: string | null
  creator_location: string | null
  item_image_url: string | null
}

export interface GroupBuyParticipant {
  id: number
  group_buy_id: string
  buyer_id: string
  quantity: number
  created_at: string
}

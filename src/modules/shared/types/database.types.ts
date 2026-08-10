export type PHPaymentMethod = 'gcash' | 'maya' | 'palawan_express' | 'cliqq_7eleven' | 'bank_transfer' | 'cash_otc';
export type EventBookingStatus = 'pending_deposit' | 'confirmed' | 'completed' | 'cancelled';
export type VenueSlotBlock = 'morning_lunch' | 'evening_dinner' | 'whole_day';
export type PHEventType = 'debut_18th' | 'wedding' | 'christening_banyag' | 'baranggay_fiesta' | 'corporate_party' | 'private_gathering';

export interface EventVenue {
    id: string;
    name: string;
    slug: string;
    description: string;
    max_guest_capacity: number;
    base_rental_rate_php: number;
    is_under_maintenance: boolean;
    image_urls: string[];
    created_at: string;
}

export interface EventPackage {
    id: string;
    name: string;
    description: string;
    included_catering_headcount: number;
    has_sounds_and_lights: boolean;
    has_stage_backdrop: boolean;
    price_php: number;
}

export interface EventAddOn {
    id: string;
    name: string;
    description: string;
    price_php: number;
}

export interface SlotBlockAvailability {
    slot_block: VenueSlotBlock;
    label: string;
    time_range: string;
    price_php: number;
    status: 'available' | 'held' | 'booked';
    held_expires_at?: string;
}

export interface EventBookingPayload {
    venue_id: string;
    event_date: string;
    slot_block: VenueSlotBlock;
    event_type: PHEventType;
    package_id: string;
    add_on_ids: string[];
    expected_guest_count: number;
    total_amount_php: number;
    required_deposit_php: number;
    remaining_balance_php: number;
    payment_method: PHPaymentMethod;
    organizer_name: string;
    organizer_email: string;
    organizer_phone: string;
}

export interface EventBookingRecord extends EventBookingPayload {
    id: string;
    status: EventBookingStatus;
    created_at: string;
}

export interface ServerActionResponse<T = void> {
    success: boolean;
    message?: string;
    data?: T;
}
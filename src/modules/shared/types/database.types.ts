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
    slot_duration_text?: string;
    is_under_maintenance: boolean;
    is_featured: boolean;
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

export interface SiteSettings {
    id: number;
    top_banner_text: string;
    business_name: string;
    business_subtitle: string;
    nav_link_1_label: string;
    nav_link_2_label: string;
    nav_link_3_label: string;
    nav_cta_button_text: string;
    hero_season_badge_text: string;
    hero_season_badge_icon: string;
    hero_headline_main: string;
    hero_headline_highlight: string;
    hero_subtitle: string;
    hero_cta_button_text: string;
    hero_scroll_label: string;
    // Social Proof Settings
    show_social_proof_bar: boolean;
    proof_1_text: string;
    proof_1_icon: string;
    proof_2_text: string;
    proof_2_icon: string;
    proof_3_text: string;
    proof_3_icon: string;
    // Admin Portal Settings
    admin_portal_label: string;
    admin_portal_title: string;
    updated_at?: string;
}

export interface ServerActionResponse<T = void> {
    success: boolean;
    message?: string;
    data?: T;
}
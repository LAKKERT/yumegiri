export interface Reservation {
    name: string;
    booked_date: Date;
    phone_number: string;
    restaurant_id: number;
    place_id: string;
}

export interface Mockup {
    mockup: string;
    mockup_height: number;
    mockup_width: number;
}
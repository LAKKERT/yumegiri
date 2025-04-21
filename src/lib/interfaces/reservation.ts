interface FormInterface {
    name: string;
    booked_date: Date;
    phone_number: string;
    restaurant_id: number;
    place_Id: number;
}

interface RestaurantInterface extends MockupInterface {
    id: number;
    name: string;
    description: string;
    address: number;
    phone_number: string;
}

interface MockupInterface {
    mockup: string;
    mockup_height: number;
    mockup_width: number;
}

interface SeatsInterface {
    id: number;
    place_name: string;
    description: string;
    number_of_seats: number;
    restaurant_id: number;
    image: string;
    x: number;
    y: number;
}
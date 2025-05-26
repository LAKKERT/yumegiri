export interface Restaurant {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    description: string;
    cover: string;
    floors: {
        uuid: string;
        mockup: string;
        mockup_height: number;
        mockup_width: number;
        level: number;
        restaurant_id: number;
        places: {
            id: number;
            visible: boolean;
            place_name: string
            description: string;
            status: boolean;
            number_of_seats: number;
            image: string;
            x: number;
            y: number;
            floor_id: string;
        }[];
    }[];
}

export interface Seats {
    uuid: string;
    name: string;
    description: string;
    numberOfSeats: number;
    image: File | null;
    x: number
    y: number
    xPer: number
    yPer: number
}

export interface Places {
    restaurant_name: string;
    address: string;
    phone_number: string;
    description: string;
    cover: File | null;
    floors: {
        uuid: string;
        mockUP: File | null;
        mockup_height: number;
        mockup_width: number;
        seats: Seats[];
    }[]
}

export interface MockUpSizes {
    width: number;
    height: number;
}
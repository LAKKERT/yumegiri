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
            id: string;
            visible: boolean;
            name: string;
            description: string;
            status: boolean;
            number_of_seats: number;
            image: string;
            x: number;
            y: number;
            xPer: number;
            yPer: number;
            floor_id: string;
        }[];
    }[];
}

export interface Seats {
    id: string;
    name: string;
    description: string;
    number_of_seats: number;
    image: File | null;
    visible: boolean;
    x: number;
    y: number;
    xPer: number;
    yPer: number;
}

export interface Floors {
    uuid: string;
    mockup: File | null;
    mockup_height: number;
    mockup_width: number;
    places: Seats[];
}

export interface Places {
    id: number;
    restaurant_name: string;
    address: string;
    phone_number: string;
    description: string;
    cover: File | null;
    floors: Floors[]
}

export interface MockUpSizes {
    width: number;
    height: number;
}

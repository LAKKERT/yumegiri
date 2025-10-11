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
    status: boolean;
    x: number;
    y: number;
    xPer: number;
    yPer: number;
}

export interface Table {
    id: string;
    floor_id?: string;
    floor_order: number;
    order?: number;
    status?: boolean;
    number_of_seats?: number;
}

export interface Floors {
    uuid: string;
    mockup: File | null;
    order: number;
    hasMockupUpdate: boolean;
    mockup_height?: number;
    mockup_width?: number;
    // places: Seats[];
    tables: Table[];
}

export interface Gallery {
    id: number;
    image: string;
    restaurant_id: number;
}

export interface Places {
    id: number;
    restaurant_name: string;
    address: string;
    phone_number: string;
    description: string;
    cover: File | null;
    gallery: FileList | Gallery[] | null;
    floors: Floors[];
}

export interface MockUpSizes {
    width: number;
    height: number;
}

export interface ChangeSeatsStatus {
    place_id: string;
    status: boolean;
}

export interface DeletedScene {
    index: number | null;
    isDeleted?: boolean
}
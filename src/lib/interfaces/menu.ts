export interface Dishes {
    id: number;
    name: string;
    description: string;
    weight: number;
    price: number;
    kcal: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    category_id: number;
    category: string;
    image: string;
    category_name: string;
}

export interface Categories {
    id: number;
    name: string;
}

export interface AddDish {
    name: string,
    description: string,
    weight: number,
    price: number,
    kcal: number,
    proteins: number,
    carbohydrates: number,
    fats: number,
    category: string,
}
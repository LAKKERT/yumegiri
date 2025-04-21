interface DishesInterface {
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

interface CategoriesInterface {
    id: number;
    name: string;
}

interface AddDishInterface {
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
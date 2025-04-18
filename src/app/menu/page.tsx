'use client';

import { Header } from "@/app/components/header";
import { MenuList } from "@/app/components/menu/menuList";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface dishesInterface {
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

interface categoriesInterface {
    id: number;
    name: string;
}

export default function Menu() {
    const [dishesData, setDishesData] = useState<dishesInterface[]>([]);
    const [categories, setCategories] = useState<categoriesInterface[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<categoriesInterface[]>([]);

    useEffect(() => {
        const getDishes = async () => {
            try {
                const response = await fetch(`/api/menu/getDishesAPI`, {
                    method: "GET",
                    headers: {
                        "Content-Type": 'Application/json',
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    setCategories(result.categories)
                    setDishesData(result.dishes);
                } else {
                    console.log('error getting data');
                }

            } catch (error) {
                console.log(error);
            }
        }

        getDishes();
    }, [])

    useEffect(() => {
        const cats = categories.filter(category => 
            dishesData.some(dish => dish.category_id === category.id)
        );
        setFilteredCategories(cats);
    }, [categories, dishesData]);

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <div className="min-h-[calc(100vh-100px)] w-full flex justify-center bg-[#e4c3a2] px-2">
                <div className="h-full max-w-7xl w-full flex gap-4 mt-4">
                    <div className="flex flex-col items-center gap-2">
                        <Link className={`text-black`} href="/menu/addDish" >
                            <div className="flex flex-row text-nowrap w-fit bg-white p-2 rounded-2xl">
                                ДОБАВИТЬ +
                            </div>
                        </Link>
                        {categories.length > 0 ? (
                            <MenuList categories={filteredCategories} />
                        ) : (
                            null
                        )}
                    </div>

                    <div className="w-full">
                        {filteredCategories?.map((category) => (
                            <div id={`${category.id}`} key={category.id} className="mb-8 scroll-m-[120px]">
                                <h3 className="text-2xl font-bold text-black mb-4">
                                    {category.name.toUpperCase()}
                                </h3>

                                <div className="flex flex-row flex-wrap gap-4 lg:flex-col">
                                    {dishesData
                                        .filter(dish => dish.category_id === category.id)
                                        .map((dish) => (
                                            <div key={dish.id}>
                                                <div className="w-[300px] lg:w-full h-auto lg:h-[250px] flex lg:flex-row flex-col bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                                                    <div className="relative w-[300px] h-[300px] lg:h-full flex-shrink-0">
                                                        <Image
                                                            src={`http://localhost:3000/${dish.image}`}
                                                            alt="Sushi"
                                                            layout="fill"
                                                            objectFit="cover"
                                                            quality={100}
                                                        />
                                                    </div>

                                                    <div className="w-full p-4 flex flex-col">
                                                        <h3 className="text-xl lg:text-3xl font-bold mb-4 text-amber-900 font-kiwimaru">{dish.name}</h3>

                                                        <p className="h-full text-gray-700 mb-4 line-clamp-4 text-base lg:text-lg">
                                                            {dish.description}
                                                        </p>

                                                        <div className="flex justify-between">
                                                            <span className="text-2xl font-light text-black">{dish.weight}г</span>
                                                            <span className="text-2xl font-bold text-amber-700">{dish.price}₽</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
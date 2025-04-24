'use client';

import { Header } from "@/app/components/header";
import { MenuList } from "@/app/components/menu/menuList";
import { DishDetail } from "../components/menu/dishDetail";
import { EditDish } from "../components/menu/editDish";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Menu() {
    const [dishesData, setDishesData] = useState<DishesInterface[]>([]);
    const [categories, setCategories] = useState<CategoriesInterface[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<CategoriesInterface[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [deleteDishes, setDeleteDishes] = useState<number[]>([]);

    const [showDetail, setShowDetail] = useState(false);
    const [showDetailIndex, setShowDetailIndex] = useState<number | null>(null);

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

    const handleDeleteDishes = async (dishIds: (number[])) => {
        try {
            const response = await fetch(`/api/menu/deleteDishesAPI`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dishIds)
            });

            if (response.ok) {
                window.location.reload();
            }

        } catch (error) {
            console.log('Error deleting dishes: ', error);
        }
    }

    console.log(deleteDishes)

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />

            {showDetailIndex !== null ? (
                <div className={`fixed min-h-[calc(100vh-100px)] w-full z-50 ${showDetail ? 'bg-[#6d6c6c67] block' : 'bg-transparent hidden'}`}
                // onClick={() => setShowDetail(false)}
                >
                    <motion.div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[920px] w-full max-h-[450px] h-full z-40 ${showDetail ? 'block' : 'hidden'}`}
                    >
                        <div className={`w-full flex flex-row justify-end gap-4 z-50`}>
                            <button
                                className="uppercase cursor-pointer"
                                onClick={() => setEditMode(true)}
                            >
                                Редактировать
                            </button>

                            <button
                                className="uppercase cursor-pointer"
                                onClick={() => setShowDetail(false)}
                            >
                                закрыть
                            </button>
                        </div>
                        {!editMode ? (
                            <DishDetail dishesData={dishesData[showDetailIndex]} />
                        ) : (
                            <EditDish dishesData={dishesData[showDetailIndex]} />
                        )}
                    </motion.div>
                </div>
            ) : (
                null
            )}

            <div className={`min-h-[calc(100vh-100px)] w-full flex justify-center bg-[#e4c3a2] px-2 `}>
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
                        <div className="flex gap-4">
                            <button type="button" className="cursor-pointer" onClick={() => setDeleteMode(prev => !prev)}>ВЫБРАТЬ БЛЮДА</button>

                            {deleteDishes.length > 0 ? (
                                <button type="button" className="cursor-pointer" onClick={() => handleDeleteDishes(deleteDishes)}>УДАЛИТЬ БЛЮДА</button>
                            ) : (
                                null
                            )}
                        </div>

                        {filteredCategories?.map((category) => (
                            <div id={`${category.id}`} key={category.id} className="mb-8 scroll-m-[120px]">
                                <h3 className="text-2xl font-bold text-black mb-4">
                                    {category.name.toUpperCase()}
                                </h3>

                                <div className="flex flex-row flex-wrap gap-4 lg:flex-col z-20">
                                    {dishesData
                                        .filter(dish => dish.category_id === category.id)
                                        .map((dish, dishIndex) => (
                                            <div
                                                key={dish.id}
                                                className="relative cursor-pointer"
                                            >
                                                {/* <div className="absolute left-0 top-0 w-6 h-6 rounded-tl-2xl bg-[#c28585] z-40">

                                                </div> */}

                                                <div
                                                    className={`w-[300px] lg:w-full h-auto lg:h-[250px] flex lg:flex-row flex-col bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${deleteDishes.includes(dish.id) ? 'scale-95 outline-2 outline-orange-500' : 'scale-100'}`}
                                                    onClick={() => {
                                                        if (!deleteMode) {
                                                            setShowDetailIndex(dishIndex)
                                                            setShowDetail(prev => !prev)
                                                        } else {
                                                            setDeleteDishes((prev) => {
                                                                const newArray = prev.includes(dish.id)
                                                                    ? prev.filter((item) => item !== dish.id)
                                                                    : [...prev, dish.id]

                                                                return newArray;
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <div className="relative w-[300px] h-[300px] lg:h-full flex-shrink-0">
                                                        <Image
                                                            src={`http://localhost:3000/${dish.image}`}
                                                            alt="Dish"
                                                            fill
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
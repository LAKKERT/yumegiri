'use client';

import Image from "next/image";

interface Props {
    dishesData: DishesInterface
}

export function DishDetail({ dishesData }: Props) {
    return (
        <div className="flex flex-row bg-white rounded-2xl overflow-hidden z-50">
            <div className="relative w-[450px] h-[450px] bg-white">
                <Image
                    src={`http://localhost:3000/${dishesData.image}`}
                    alt='Dish'
                    fill
                    objectFit="cover"
                />
            </div>

            <div className="flex flex-col items-center gap-4 flex-1 text-black p-4">
                <h3 className="text-2xl">{dishesData.name}</h3>

                <p className="text-lg">{dishesData.description}</p>

                <div className="flex flex-row gap-4">
                    <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="text-xl">{dishesData.kcal}</span>
                        <span className="select-none">ККал</span>
                    </div>

                    <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="text-xl">{dishesData.proteins}</span>
                        <span className="select-none">Белки</span>
                    </div>

                    <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="text-xl">{dishesData.carbohydrates}</span>
                        <span className="select-none">Углеводы</span>
                    </div>

                    <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="text-xl">{dishesData.fats}</span>
                        <span className="select-none">Жиры</span>
                    </div>

                </div>

                <div className="w-full flex justify-between text-xl">
                    <span className="text-2xl font-light text-black select-none">{dishesData.weight}г</span>
                    <span className="text-2xl font-light text-black select-none">{dishesData.price}￥</span>
                </div>
            </div>
        </div>
    )
}
'use client';

import Image from "next/image";

interface Props {
    dishesData: DishesInterface
}

export function DishDetail({ dishesData }: Props) {
    return (
        <div className="flex flex-col lg:flex-row bg-white rounded-2xl overflow-hidden z-50">
            <div className="relative w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] bg-white">
                <Image
                    src={`http://localhost:3000/${dishesData.image}`}
                    alt='Dish'
                    fill
                    objectFit="cover"
                />
            </div>

            <div className="w-[350px] lg:w-auto flex flex-col items-center gap-2 lg:gap-4 flex-1 text-black p-4">
                <h3 className="text-xl lg:text-2xl">{dishesData.name}</h3>

                <p className="lg:text-lg">{dishesData.description}</p>

                <div className="flex flex-row gap-2 lg:gap-4">
                    <div className="relative w-[60px] lg:w-[90px] h-[55px] lg:h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="lg:text-xl">{dishesData.kcal}</span>
                        <span className="text-sm lg:text-lg select-none">ККал</span>
                    </div>

                    <div className="relative w-[60px] lg:w-[90px] h-[55px] lg:h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="lg:text-xl">{dishesData.proteins}</span>
                        <span className="text-sm lg:text-lg select-none">Белки</span>
                    </div>

                    <div className="relative w-[60px] lg:w-[90px] h-[55px] lg:h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="lg:text-xl">{dishesData.carbohydrates}</span>
                        <span className="text-sm lg:text-lg select-none">Углеводы</span>
                    </div>

                    <div className="relative w-[60px] lg:w-[90px] h-[55px] lg:h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                        <span className="lg:text-xl">{dishesData.fats}</span>
                        <span className="text-sm lg:text-lg select-none">Жиры</span>
                    </div>

                </div>

                <div className="w-full flex justify-between text-xl">
                    <span className="text-xl lg:text-2xl font-light text-black select-none">{dishesData.weight}г</span>
                    <span className="text-xl lg:text-2xl font-light text-black select-none">{dishesData.price}￥</span>
                </div>
            </div>
        </div>
    )
}
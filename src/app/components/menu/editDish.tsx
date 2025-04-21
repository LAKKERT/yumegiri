'use client';

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import Image from "next/image";
import { yupResolver } from "@hookform/resolvers/yup";

interface Props {
    dishesData: DishesInterface
}

const validationSchema = Yup.object().shape({
    name: Yup.string(),
    description: Yup.string(),
    weight: Yup.number(),
    price: Yup.number(),
    kcal: Yup.number(),
    proteins: Yup.number(),
    carbohydrates: Yup.number(),
    fats: Yup.number(),
    category_id: Yup.number(),
    category: Yup.string(),
    category_name: Yup.string(),
})

export function EditDish({ dishesData }: Props) {

    const { register, handleSubmit, formState: { errors }, reset } = useForm<DishesInterface>({
        // resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        reset({
            id: dishesData.id,
            name: dishesData.name,
            description: dishesData.description,
            kcal: dishesData.kcal,
            proteins: dishesData.proteins,
            carbohydrates: dishesData.carbohydrates,
            fats: dishesData.fats,
            weight: dishesData.weight,
            price: dishesData.price,
            category_id: dishesData.category_id,
            image: dishesData.image
        })
    }, [dishesData])

    const onsubmit = async (data) => {
        console.log(data)

        try {
            const response = await fetch(`/api/menu/updateDishAPI`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'Application/json',
                },
                body: JSON.stringify(data)
            })
            console.log('test')
            if (response.ok) {
                window.location.reload();
            }
        }catch (error) {
            console.error('Database error occured', error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onsubmit)}>
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
                    <input className="w-3/4 text-center border-b-2 border-black outline-none focus:outline-none caret-black" {...register('name')} type="text" placeholder="НАЗВАНИЕ" />

                    <textarea {...register('description')}
                        placeholder="ОПИСАНИЕ"
                        className="w-3/4 h-full resize-none outline-2 outline-black rounded-xl p-2 caret-black"
                    />

                    {/* <select {...register('category')}>
                    {categories?.map((category, category_id) => (
                        <option key={category_id} value={`${category.id}`} >{category.name}</option>
                    ))}
                </select> */}

                    <div className="flex flex-row gap-4">
                        <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                            <input {...register('kcal')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                            <span className="select-none">ККал</span>
                        </div>

                        <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                            <input {...register('proteins')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                            <span className="select-none">Белки</span>
                        </div>

                        <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                            <input {...register('carbohydrates')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                            <span className="select-none">Углеводы</span>
                        </div>

                        <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                            <input {...register('fats')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                            <span className="select-none">Жиры</span>
                        </div>

                    </div>

                    <div className="w-full flex justify-between text-xl">
                        <input
                            {...register('weight')}
                            className="caret-black text-center w-[80px] border-b-2 border-black outline-none focus:outline-none"
                            type="text"
                            placeholder="Грамм"
                        />
                        <input {...register('price')}
                            className="caret-black text-center w-[80px] border-b-2 border-black outline-none focus:outline-none"
                            type="text"
                        />
                    </div>

                    <button type="submit" className="cursor-pointer text-black">сохранить изменения</button>
                </div>
            </div>
        </form>
    )
}
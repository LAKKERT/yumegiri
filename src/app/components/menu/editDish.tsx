'use client';

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import Image from "next/image";
import { yupResolver } from "@hookform/resolvers/yup";
import { Categories, Dishes } from "@/lib/interfaces/menu";
import { processData } from "@/helpers/readFiles";
import { supabase } from "@/db/supabaseConfig";
import { saveImage, saveRestaurantFiles } from "@/helpers/saveImage";

interface Props {
    dishesData: Dishes
    categories: Categories[]
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

export function EditDish({ dishesData, categories }: Props) {
    const [selectedFile, setSelectedFile] = useState<File>();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<Dishes>({
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

    const getFileName = async (file: File, category: number) => {

        const categoryName = categories?.find(c => c.id === category);
        const fullName = file.name;

        const newName = `${Date.now()}_${fullName}`;
        const path = `/menu/${categoryName?.name}/`;
        const fullPath = `${path}${newName}`;
        return { newName, path, fullPath }
    }

    const onsubmit = async (data: Dishes) => {
        let coverProperties

        if (selectedFile) {
            const coverData = await processData(selectedFile)
            coverProperties = await getFileName(selectedFile, data.category_id);
    
            await saveImage(coverData as string, coverProperties.path, coverProperties.newName);
        }


        try {
            if (process.env.NEXT_PUBLIC_ENV === 'production') {
                const { error } = await supabase
                    .from('menu')
                    .update({
                        name: data.name,
                        description: data.description,
                        kcal: data.kcal,
                        proteins: data.proteins,
                        carbohydrates: data.carbohydrates,
                        fats: data.fats,
                        weight: data.weight,
                        price: data.price,
                        category_id: data.category_id,
                        image: selectedFile ? coverProperties?.fullPath : dishesData.image,
                    })
                    .eq('id', dishesData.id)

                if (error) console.error(error);
                else window.location.reload();

            } else {
                const response = await fetch(`/api/menu/updateDishAPI`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'Application/json',
                    },
                    body: JSON.stringify(data)
                })
                if (response.ok) {
                    window.location.reload();
                }
            }
        } catch (error) {
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
                    <input id='imageInput' onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            setSelectedFile(files[0])
                        }
                    }} className="text-black hidden" type="file" accept="image/*" />
                    <label className="absolute bottom-5 left-1/2 transform -translate-x-1/2 cursor-pointer text-black z-20" htmlFor="imageInput">ВЫБРАТЬ КАРТИНКУ</label>
                </div>

                <div className="flex flex-col items-center gap-4 flex-1 text-black p-4">
                    <input className="w-3/4 text-center border-b-2 border-black outline-none focus:outline-none caret-black" {...register('name')} type="text" placeholder="НАЗВАНИЕ" />

                    <textarea {...register('description')}
                        placeholder="ОПИСАНИЕ"
                        className="w-3/4 h-full resize-none outline-2 outline-black rounded-xl p-2 caret-black"
                    />

                    <select {...register('category')}>
                        {categories?.map((category, category_id) => (
                            <option key={category_id} value={`${category.id}`} >{category.name}</option>
                        ))}
                    </select>

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
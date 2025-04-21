'use client';

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationForm = Yup.object().shape({
    name: Yup.string().min(3, 'Название должно содержать минимум 3 символа').required('Поле обязательно для заполнения'),
})

interface FormInterface {
    name: string;
}

interface CategoriesInterface {
    id: number;
    name: string;
}

interface ReciveData {
    categories: CategoriesInterface[]
}

export function MenuList(categoriesids: ReciveData) {
    
    const allCategories = categoriesids.categories

    const { register, handleSubmit, formState: { errors } } = useForm<FormInterface>({
        resolver: yupResolver(validationForm)
    });

    const onsubmit = async (data: FormInterface) => {
        try {
            const response = await fetch('/api/menu/addCategoryAPI', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                window.location.reload()
            } else {
                console.error('DataBase error occured')
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="h-[500px] min-w-[300px] hidden md:flex flex-col items-center p-3 text-black bg-white rounded-2xl shadow-xl">
            <h2>МЕНЮ</h2>

            <div>
                { allCategories?.map((category, category_id) => (
                    <div className="text-base" key={category_id}>
                        <a href={`#${category.id}`}>{category.name}</a>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col">
                <input {...register('name')} className="text-center w-full border-b-2 border-black outline-0 caret-black" type="text" />
                <button type="submit">ДОБАВИТЬ</button>
            </form>
        </div>
    )
}
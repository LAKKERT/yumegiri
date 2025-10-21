'use client';

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "@/db/supabaseConfig";
import { Categories } from "@/lib/interfaces/menu";
import { useState } from "react";

const validationForm = Yup.object().shape({
    name: Yup.string().min(3, 'Название должно содержать минимум 3 символа').required('Поле обязательно для заполнения'),
})

interface ReciveData {
    categories: Categories[];
    userRole: string;
}

export function MenuList({categories, userRole}: ReciveData) {
    const [currentCat, setCurrentCat] = useState<string>('');
    const { register, handleSubmit, formState: { errors } } = useForm<{name: string}>({
        resolver: yupResolver(validationForm)
    });

    const onsubmit = async (data: { name: string }) => {
        try {
            if (process.env.NEXT_PUBLIC_ENV === 'production') {
                const { error } = await supabase
                    .from('categories')
                    .insert({
                        name: data.name
                    });
                if (error) console.error(error);
            } else {
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
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="h-[500px] min-w-[300px] hidden md:flex flex-col items-center gap-2 p-3 text-black bg-white rounded-2xl shadow-xl">
            <h2>КАТЕГОРИИ</h2>

            <div className={`w-full flex flex-col gap-2 font-light text-xl`}>
                {categories.length > 0 && categories.map((category) => (
                    <div key={category.id}>
                        <a className={`font-[family-name:var(--font-pacifico)] underline hover:text-[#bb4d00] transition-colors duration-300 ${currentCat === category.name ? 'text-[#bb4d00]' : ''}`} href={`#${category.id}`} onClick={() => setCurrentCat(category.name)}>{category.name}</a>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onsubmit)} className={`flex flex-col gap-2 ${userRole === 'admin' ? '' : 'hidden'}`}>
                {errors.name ? (
                    <p className="text-center text-red-400 font-[family-name:var(--font-arimo)]">{errors.name.message}</p>
                ): (
                    null
                )}
                <input {...register('name')} className="text-center w-full border-b-2 border-black outline-0 caret-black" type="text" placeholder="Название" />
                <button type="submit" className="cursor-pointer">ДОБАВИТЬ</button>
            </form>
        </div>
    )
}
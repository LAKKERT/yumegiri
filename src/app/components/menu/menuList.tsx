'use client';

import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "@/db/supabaseConfig";
import { Categories } from "@/lib/interfaces/menu";

const validationForm = Yup.object().shape({
    name: Yup.string().min(3, 'Название должно содержать минимум 3 символа').required('Поле обязательно для заполнения'),
})

interface ReciveData {
    categories: Categories[];
    userRole: string;
}

export function MenuList({categories, userRole}: ReciveData) {
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
        <div className="h-[500px] min-w-[300px] hidden md:flex flex-col items-center p-3 text-black bg-white rounded-2xl shadow-xl">
            <h2>МЕНЮ</h2>

            <div>
                {categories.length > 0 && categories.map((category) => (
                    <div className="text-base" key={category.id}>
                        <a href={`#${category.id}`}>{category.name}</a>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onsubmit)} className={`flex flex-col ${userRole === 'admin' ? '' : 'hidden'}`}>
                <input {...register('name')} className="text-center w-full border-b-2 border-black outline-0 caret-black" type="text" placeholder="Название" />
                <button type="submit">ДОБАВИТЬ</button>
            </form>
        </div>
    )
}
"use client";

import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { User } from "@/lib/interfaces/user";
import { supabase } from "@/db/supabaseConfig";
import { Header } from "@/app/components/header";

const validationSchema = Yup.object().shape({
    email: Yup.string().email('EMAIL is not correct').required('Enter your EMAIL'),
    username: Yup.string().min(4, 'Username must be at least 4 characters').required('Enter your username'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Enter your password'),
    password2: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm your password'),
})

export default function SingUp() {

    const { register, handleSubmit, formState: { errors } } = useForm<User>({
        resolver: yupResolver(validationSchema)
    });

    const onSubmit = async (formData: User) => {
        try {
            if (process.env.NEXT_PUBLIC_ENV === 'production') {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                        }
                    }
                })
                if (error) console.error(error);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
         <div className="flex justify-center items-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full flex justify-center items-center">
                <input {...register("email")} type="email" placeholder="email" />
                <input {...register("username")} type="text" placeholder="username" />
                <input {...register("password")} type="password" placeholder="password" />
                <input {...register("password2")} type="password" placeholder="repeat password" />

                <input type="submit" />
            </form>
        </div>
    );
}

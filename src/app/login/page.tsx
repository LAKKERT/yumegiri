'use client';

import { useForm } from "react-hook-form";
import { Header } from "../components/header";
import { supabase } from "@/db/supabaseConfig";
import { useRouter } from "next/navigation";

export default function Login() {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data) => {
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        });

        if (loginError) console.error(loginError);
        else router.push('/');
    }

    return (
         <div className="flex justify-center items-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white text-black">
                    <input {...register('email')} type="email" />
                    <input {...register('password')} type="password" />
                    <button type="submit">
                        LOGIN
                    </button>
                </div>
            </form>
        </div>
    )
}
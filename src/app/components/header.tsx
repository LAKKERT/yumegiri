"use client";

import Link from "next/link";

export function Header() {

    return (
        <div className={`flex items-center fixed top-0 w-full h-[100px] bg-[#FFA685] text-nowrap font-[family-name:var(--font-pacifico)] z-50`}>
            <div className="mx-auto flex justify-center items-center flex-row gap-5 tracking-wide text-md 2xl:text-lg">
                <Link href="/menu" className={`hidden lg:block py-2 px-4 transition-colors duration-300 border-2 rounded-xl border-transparent hover:border-white`}>
                    МЕНЮ
                </Link>

                <Link href="/reservation" className={`hidden lg:block py-2 px-4 transition-colors duration-300 border-2 rounded-xl border-transparent hover:border-white`}>
                    ЗАРЕЗИРВИРОВАТЬ СТОЛ
                </Link>

                <Link href="/" className="text-3xl font-[family-name:var(--font-kiwimaru)]">
                    ユ メギリ
                </Link>

                <Link href="#" className={`hidden lg:block py-2 px-4 transition-colors duration-300 border-2 rounded-xl border-transparent hover:border-white`}>
                    ОСТАВИТЬ ОТЗЫВ
                </Link>

                <Link href="#" className={`hidden lg:block py-2 px-4 transition-colors duration-300 border-2 rounded-xl border-transparent hover:border-white`}>
                    ПОМОЩЬ
                </Link>
            </div>
        </div>
    )
}
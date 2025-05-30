'use client';
import Image from "next/image";
import Link from "next/link";

export function MenuPart() {

    return (
        <div className="h-screen relative flex flex-row justify-evenly items-center">
            <div className="relative min-h-[418px] flex-shrink-0 w-[700px]">
                <Image className="absolute" src={"/home/romen.png"} alt="menu image" width={700} height={464}></Image>
            </div>
            <div className="h-auto text-4xl">
                <Link href="#">МЕНЮ</Link>
            </div>
        </div>
    );
}
'use client';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";


export function MenuPart() {

    return (
        <div className="h-screen relative flex flex-row justify-evenly items-center">
            <div className="relative min-h-104.5 shrink-0 w-175">
                <Image className="absolute" src={"/home/romen.png"} alt="menu image" width={700} height={464}></Image>
            </div>

            <div className="h-auto text-center w-200">
                <p className="leading-12 uppercase text-3xl [word-spacing:10px] [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]">Рамен — сердце японской кухни. Простой на первый взгляд, но глубокий по вкусу.</p>
                <motion.div
                    className="mt-4"
                    whileHover={{
                        scale: [1, .95, 1],
                     }}
                    transition={{
                        scale: {
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }
                    }}
                >
                    <Link href="/menu" className="uppercase underline underline-offset-8 text-4xl [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]">Загляни в меню 🍜</Link>
                </motion.div>
            </div>
        </div>
    );
}
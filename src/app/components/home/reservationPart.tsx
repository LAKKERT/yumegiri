'use client';
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { button } from "@/lib/variants/home";

export function ReservationPart() {
    const { scrollYProgress } = useScroll();

    const pointerEvents = useTransform(scrollYProgress, (progress) =>
        progress >= .25 ? "auto" : "none"
    );

    return (
        <div className="h-screen flex flex-row justify-center items-center">
            <div className="relative min-h-200 shrink-0 w-175 z-0">
                <motion.div
                    className={`z-20 relative`}
                    animate={{
                        y: [0, -25, 25, 0]
                    }}
                    transition={{
                        delay: .5,
                        duration: 6,
                        bounce: 0.25,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        times: [0, 0.3, 0.7, 1]
                    }}
                >
                    <Image
                        className="absolute top-45 -left-11.25"
                        src={"/home/pen.png"}
                        alt="pen"
                        width={350}
                        height={230}
                    />
                </motion.div>

                <motion.div
                    className={`z-0`}
                    animate={{
                        y: [0, -30, 30, 0]

                    }}

                    transition={{
                        duration: 6,
                        bounce: 0.25,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        times: [0, 0.3, 0.7, 1]
                    }}
                >
                    <Image
                        className="absolute top-40 right-10 scale-125"
                        src={"/home/book.png"}
                        alt="book"
                        width={1000}
                        height={600}
                    />
                </motion.div>
            </div>

            <motion.div
                className={`text-center w-200 z-10 [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]`}
                style={{
                    pointerEvents: pointerEvents
                }}
            >
                <p className="leading-12 uppercase text-3xl [word-spacing:10px] [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]">Оставь своё имя в книге гостей и мы подготовим столик для тебя</p>
                <motion.div
                    className="mt-4"  
                    variants={button}
                    initial='init'
                    whileHover="hover"
                >

                    <Link className="uppercase underline underline-offset-8 text-4xl [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]" href="/restaurants"
                        onClick={(e) => {
                            if (scrollYProgress.get() < .25) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Зарезирвировать столик
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
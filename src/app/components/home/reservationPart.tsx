'use client';
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function ReservationPart() {

    const { scrollYProgress } = useScroll();



    const pointerEvents = useTransform(scrollYProgress, (progress) => 
        progress >= .25 ? "auto" : "none"
    );

    return (
        <div className="h-screen flex flex-row justify-center items-center">
            <div className="relative min-h-[800px] flex-shrink-0 w-[700px] z-0">
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
                        className="absolute top-45 left-[-45px]"
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
                className={`z-10`}
                style={{
                    pointerEvents: pointerEvents
                }}
            >
                <Link className="text-4xl" href="#"
                    onClick={(e) => {
                        if (scrollYProgress.get() < .25) {
                            console.log('2341324')
                            e.preventDefault();
                        }
                    }}
                >
                    Зарезирвировать столик
                </Link>
            </motion.div>
        </div>
    );
}
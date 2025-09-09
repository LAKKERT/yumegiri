'use client';

import { Header } from "@/app/components/header";
import { InrtoductionPart } from "@/app/components/home/introductionPart";
import { ReservationPart } from "@/app/components/home/reservationPart";
import { MenuPart } from "@/app/components/home/menuPart";
import { PopularFood } from "@/app/components/home/popularFood";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {

    const { scrollYProgress } = useScroll();

    const scale = useTransform(scrollYProgress, [0, 0.1], [1, 1.5]);
    const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    return (
        <div className={`h-[2500px] mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent`}>
            <Header />
            <div className={`w-full h-full flex flex-col items-center bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] `}>
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 1 }}
                        className="fixed w-full h-[calc(100vh-100px)]"
                        style={{
                            scale,
                            opacity
                        }}
                    >
                        <InrtoductionPart />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0}}
                        className="fixed left-50 top-150 origin-right"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.05, 0.1, 0.2], [0, .5, 0]),
                            scale: useTransform(scrollYProgress, [0.05, 0.1, 0.2], [1, 1.5, 2.5])
                        }}
                    >
                        <Image src={'/home/cloud_5.png'} alt="cloud" width={250} height={115} />
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0}}
                        className="fixed left-150 top-40 origin-bottom"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.1, 0.15, 0.25], [0, .5, 0]),
                            scale: useTransform(scrollYProgress, [0.1, 0.15, 0.25], [1, 1.5, 2.5])
                        }}
                    >
                        <Image className="scale-125" src={'/home/cloud_7.png'} alt="cloud" width={220} height={115} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0}}
                        className="fixed right-90 top-160 origin-left"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.08, 0.13, 0.24], [0, .5, 0]),
                            scale: useTransform(scrollYProgress, [0.08, 0.13, 0.24], [1, 1.5, 2.5])
                        }}
                    >
                        <Image src={'/home/cloud_3.png'} alt="cloud" width={240} height={115} />
                    </motion.div>

                    <motion.div
                        className="fixed origin-top-left"
                        style={{
                            x: useTransform(scrollYProgress, [0.25, .3], [-500, 0] )
                        }}
                    >
                        <Image src={'/home/corner.png'} alt="cloud" width={600} height={115} />
                    </motion.div>

                    <motion.div
                        className="fixed right-0  -scale-x-100"
                        style={{
                            x: useTransform(scrollYProgress, [0.25, .3], [-500, 0] )
                        }}
                    >
                        <Image src={'/home/corner.png'} alt="cloud" width={600} height={115} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        className="fixed w-full h-[calc(100vh-100px)] origin-center"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.15, 0.2, 0.28, .3], [0, 0.8, 1, .8]),
                            scale: useTransform(scrollYProgress, [0.05, 0.2, 0.3], [0, 0.8, 1]),
                            y: useTransform(scrollYProgress, [0.65, .8], [0, -1000]),
                        }}
                    >
                        <MenuPart />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 1 }}
                        className="fixed w-full h-[calc(100vh-100px)]"
                        style={{
                            opacity: useTransform(scrollYProgress, [0.4, .43], [0, 1]),
                            scale: useTransform(scrollYProgress, [0.4, .43], [0.8, 1]),
                            y: useTransform(scrollYProgress, [0.7, 1], [800, 0]),
                        }}
                    >
                        <ReservationPart />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

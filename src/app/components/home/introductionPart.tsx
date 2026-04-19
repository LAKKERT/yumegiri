'use client';

import Image from "next/image";
import { motion } from "framer-motion";

export function InrtoductionPart() {

    return (
        <div className="relative h-screen">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <p className="text-center text-3xl lg:text-6xl font-(family-name:--font-kiwimaru) z-10 [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]">
                    こんにちは
                </p>

                <p className="uppercase [word-spacing:10px] text-center text-2xl mt-5 [text-shadow:0_4px_4px_rgb(0_0_0/0.5)]">мм… это рамен внизу? 🍜</p>
            </div>


            <Image className="absolute left-[10%] top-[25%] lg:top-[15%] w-[30%] h-auto scale-110" src={'/home/cloud_6.png'} alt="cloud" width={350} height={230} />
            <Image className="absolute right-[2%] bottom-[25%] lg:bottom-[25%] w-[30%]" src={'/home/cloud.png'} alt="cloud" width={350} height={230} />
            <Image className="absolute right-[15%] top-[15%] lg:top-[2%] w-[30%]" src={'/home/cloud_3.png'} alt="cloud" width={350} height={230} />
            <Image className="absolute bottom-[20%] lg:bottom-[10%] left-[0%] w-[30%]" src={'/home/cloud_4.png'} alt="cloud" width={350} height={230} />

            <motion.div
                className="absolute w-[20%] lg:w-[12%] bottom-[20%] left-1/2 -translate-x-1/2 flex items-center justify-center"
                animate={{
                    y: [0, -20, 20, 0],
                    scale: [1, .8, 1]
                }}
                transition={{
                    y: {
                        delay: .5,
                        duration: 6,
                        bounce: 0.25,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        times: [0, .3, .7, 1]
                    },            
                    
                    scale: {
                        delay: .5,
                        duration: 6,
                        bounce: .25,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: 'easeInOut',
                        times: [0, .3, .7, 1]
                    }
                }}
            >
                <Image
                    src="/home/ArrowCloud.png"
                    alt="continue"
                    width={350}
                    height={230}
                    className="max-w-full max-h-full object-contain"
                />
            </motion.div>
        </div>
    )
}
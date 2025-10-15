'use client';

import Image from "next/image";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

interface Loader {
    isLoading: boolean;
}

export default function Loader({ isLoading }: Loader) {

    const firstPoint = useMotionValue(0);
    const secondPoint = useMotionValue(0);

    const background = useTransform(
        [firstPoint, secondPoint],
        ([f, s]) =>
            `radial-gradient(rgba(255,255,255,0) ${f}%, rgba(213,127,126,1) ${s}%, rgba(255,169,135,1) 100%)`
    );
    useEffect(() => {
        if (isLoading) return;

        const turnOffLoading = async () => {
            const control = animate(firstPoint, 100, {
                ease: 'easeInOut',
                duration: 3,
            })

            animate(secondPoint, 100, {
                ease: "easeInOut",
                duration: 2,
            })

            await control;
        }

        turnOffLoading();
    }, [isLoading])


    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={'loader'}
                style={{
                    background,
                }}
                className={`flex justify-center items-center w-full min-h-[calc(100vh-100px)]`}
            >
                <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: !isLoading ? 0 : 1 }}
                    transition={{
                        duration: .5
                    }}
                    className="text-4xl [text-shadow:0_4px_4px_rgb(0_0_0_/_0.5)]"
                >
                    ЗАГРУЗКА...
                </motion.span>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute top-20 left-10 origin-right`}
                >
                    <Image src={'/home/cloud_3.png'} alt="cloud" width={200} height={115} />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute top-50 right-15 origin-left`}
                >
                    <Image src={'/home/cloud_4.png'} alt="cloud" width={280} height={115} />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute top-10 right-150 origin-left`}
                >
                    <Image src={'/home/cloud.png'} alt="cloud" width={180} height={115} />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute bottom-10 right-55 origin-left`}
                >
                    <Image src={'/home/cloud_5.png'} alt="cloud" width={220} height={115} />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute bottom-46 left-60 origin-right`}
                >
                    <Image src={'/home/cloud_6.png'} alt="cloud" width={270} height={115} />
                </motion.div>

                <motion.div
                    initial={{
                        opacity: 1,
                        scale: 1.25,
                    }}
                    animate={{
                        opacity: !isLoading ? 0 : 1,
                        scale: !isLoading ? 1.5 : 1.25,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className={`absolute bottom-[-60px] left-2 origin-right`}
                >
                    <Image src={'/home/cloud_7.png'} alt="cloud" width={270} height={115} />
                </motion.div>

            </motion.div>
        </AnimatePresence>
    )
}
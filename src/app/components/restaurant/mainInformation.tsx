"use client";

import { Places } from "@/lib/interfaces/mockup";
import { MotionValue } from "motion";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { RefObject } from "react";

interface MainInfo {
    prevImageHandler: () => void,
    nextImageHandler: () => void,
    carouselRef: RefObject<HTMLDivElement | null>,
    maskImage: MotionValue<string>,
    isLastImage: boolean,
    selectedImages: File[],
    isEditMode: boolean,
    currentRestaurant: Places | undefined,
    order: number,
}

export function MainInfo({ prevImageHandler, nextImageHandler, carouselRef, maskImage, isLastImage, selectedImages, isEditMode, currentRestaurant, order }: MainInfo) {
    return (
        <div className="flex flex-row items-center gap-4">
            <button
                type="button"
                className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                onClick={prevImageHandler}
            >
                &lt;
            </button>
            <motion.div ref={carouselRef}
                style={{
                    maskImage,
                    paddingRight: isLastImage ? "" : `${(200 * 2)}px`,
                    width: isLastImage ? `250px` : `650px`
                }}
                className={`snap-x scroll-smooth flex flex-row items-center gap-4 overflow-hidden overflow-x-hidden transform transition-all duration-300`}
            >
                {isEditMode && selectedImages.length !== 0 ? (
                    <AnimatePresence mode='wait'>
                        {selectedImages.map((image, index) => (
                            <motion.div
                                key={index}
                                id={`image${index}`}
                                className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'} ${order === index ? 'w-[275px] h-[335px]' : 'min-w-[250px] w-[250px] h-[310px]'} rounded-md`}
                                initial={{
                                    y: 80,
                                    opacity: 0
                                }}
                                exit={{
                                    y: -80,
                                    opacity: 0,
                                    background: '#000'
                                }}

                                animate={{
                                    y: 0,
                                    opacity: 100,
                                    background: '#000'
                                }}
                                transition={{
                                    duration: .3,
                                    ease: "easeInOut"
                                }}
                            >
                                <Image
                                    src={URL.createObjectURL(selectedImages[index])}
                                    alt="restaurant gallery"
                                    fill
                                    objectFit="cover"
                                    className={`rounded-md origin-center`}
                                >

                                </Image>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <AnimatePresence mode='wait'>
                        {Array.isArray(currentRestaurant?.gallery) ? (
                            currentRestaurant?.gallery.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    id={`image${index}`}
                                    className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'} ${order === index ? 'w-[275px] h-[335px]' : 'min-w-[250px] w-[250px] h-[310px]'} rounded-md`}
                                    initial={{
                                        y: 80,
                                        opacity: 0
                                    }}
                                    exit={{
                                        y: -80,
                                        opacity: 0,
                                        background: '#000'
                                    }}

                                    animate={{
                                        y: 0,
                                        opacity: 100,
                                        background: '#000'
                                    }}
                                    transition={{
                                        duration: .3,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Image
                                        src={image.image}
                                        alt="restaurant gallery"
                                        fill
                                        objectFit="cover"
                                        className={`rounded-md origin-center`}
                                    >

                                    </Image>
                                </motion.div>
                            ))
                        ) : (
                            null
                        )}
                    </AnimatePresence>
                )}
            </motion.div>
            <button
                type="button"
                className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                onClick={nextImageHandler}
            >
                &gt;
            </button>
        </div>
    )
}
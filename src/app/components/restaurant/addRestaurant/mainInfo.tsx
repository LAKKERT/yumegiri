'use client';

import Image from 'next/image';
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { RefObject } from 'react';
import { MotionValue } from "motion";
import { AnimatePresence, motion } from 'framer-motion';
import { Places } from '@/lib/interfaces/mockup';
import { UseFormRegister } from 'react-hook-form';

interface MainInfo {
    prevImageHandler: () => void;
    nextImageHandler: () => void;
    carouselRef: RefObject<HTMLDivElement | null>;
    maskImage: MotionValue<string>;
    isLastImage: boolean;
    order: number;
    register: UseFormRegister<Places>;
    gallery: File[];
}

export function MainInfo({ prevImageHandler, nextImageHandler, carouselRef, maskImage, isLastImage, order, register, gallery }: MainInfo) {

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col">
                <span className={`${styles.advice} font-(family-name:--font-kiwimaru)`}>название</span>
                <input {...register('restaurant_name')} className={`${styles.reservation_inputs}`} type="text" placeholder="НАЗВАНИЕ" />
            </div>

            <div className="flex flex-col">
                <span className={`${styles.advice} font-(family-name:--font-kiwimaru)`}>описание</span>
                <textarea
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;

                        target.style.height = "auto";
                        target.style.minHeight = "40px";
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                    {...register('description')}
                    className={`${styles.reservation_inputs} overflow-y-hidden font-(family-name:--font-marck)`}
                    placeholder="ОПИСАНИЕ"
                />
            </div>

            <div className="flex flex-col">
                <span className={`${styles.advice} font-(family-name:--font-kiwimaru)`}>адрес</span>
                <input {...register('address')} className={`${styles.reservation_inputs} font-(family-name:--font-marck)`} type="text" placeholder="АДРЕСС" />
            </div>

            <div className="flex flex-col">
                <span className={`${styles.advice} font-(family-name:--font-kiwimaru)`}>контакты</span>
                <input {...register('phone_number')} className={`${styles.reservation_inputs} font-(family-name:--font-marck)`} type="text" placeholder="НОМЕР ТЕЛЕФОНА" />
            </div>

            <div className="flex flex-row items-center gap-4">
                <button
                    type="button"
                    className="w-6.25 h-6.25 bg-white rounded-full text-black cursor-pointer"
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
                    {gallery && gallery.length > 0 ? (
                        <AnimatePresence mode='async'>
                            {gallery.map((image, index) => (
                                <motion.div
                                    key={index}
                                    id={`image${index}`}
                                    className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'} ${order === index ? 'w-68.75 h-83.75' : 'min-w-62.5 w-62.5 h-77.5'} rounded-md`}
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
                                        src={URL.createObjectURL(image)}
                                        alt="restaurant gallery"
                                        fill
                                        className={`rounded-md origin-center object-cover`}
                                    >

                                    </Image>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <AnimatePresence mode='wait'>
                            {gallery && gallery.length > 0 ? (
                                gallery.map((image, imageInd) => (
                                    <motion.div
                                        key={imageInd}
                                        className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'}  ${order === imageInd ? 'w-68.75 h-83.75' : 'mimin-w-62.5-62.5 h-77.5'} rounded-md`}
                                        initial={{ y: 80, opacity: 0 }}
                                        exit={{ y: -80, opacity: 0, background: '#000' }}
                                        animate={{ y: 0, opacity: 100, background: '#000' }}
                                        transition={{ duration: .3, ease: "easeInOut" }}
                                    >
                                        <Image
                                            src={URL.createObjectURL(image)}
                                            alt="restaurant gallery"
                                            fill
                                            style={{ objectFit: "cover" }}
                                            className="rounded-md origin-center"
                                        />
                                    </motion.div>
                                ))
                            ) : null}
                        </AnimatePresence>
                    )}
                </motion.div>
                <button
                    type="button"
                    className="w-6.25 h-6.25 bg-white rounded-full text-black cursor-pointer"
                    onClick={nextImageHandler}
                >
                    &gt;
                </button>
            </div>
        </div>
    )
}
"use client";

import { Control, Controller } from "react-hook-form";
import Image from "next/image";
import { motion, AnimatePresence, MotionValue } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { Places } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";
import { RefObject } from "react";

interface RestaurantMockUp {
    constraintsRef: RefObject<HTMLDivElement | null>,
    currentRestaurant: Places | undefined,
    currentFloor: number,
    seatsIsSelected: boolean,
    control: Control<Reservation, unknown, Reservation>,
    seatsRefs: RefObject<HTMLDivElement[]>,
    visibleMenu: {
        [key: string]: boolean;
    },
    x: MotionValue<number>
    ChangeSeatState: (mode: boolean) => void,
    onClickHandler: (index: string, placeIndex: number) => void
}

export function RestaurantMockUp({ constraintsRef, currentRestaurant, currentFloor, seatsIsSelected, control, seatsRefs, visibleMenu, x, ChangeSeatState, onClickHandler }: RestaurantMockUp) {

    return (
        <motion.div
            ref={constraintsRef}
            className={`relative mx-auto overflow-visible`}
            style={{
                width: 1110,
                height: `${currentRestaurant?.floors[currentFloor].mockup_height}px`
            }}
        >
            <AnimatePresence mode='sync'>
                <motion.div
                    key={currentRestaurant?.floors[currentFloor].mockup}
                    className={`absolute`}
                    initial={{
                        scale: 1,
                        x: x.get(),
                    }}
                    exit={{
                        scale: .75,
                        opacity: 0,
                        x: x.get(),
                    }}
                    animate={{
                        scale: 1,
                        x: 0
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    transition={{
                        duration: .3,
                    }}
                >
                    <Image
                        src={`http://localhost:3000/${currentRestaurant?.floors[currentFloor].mockup}`}
                        alt="mockup"
                        fill
                        className={`h-auto w-full rounded-2xl opacity-100`}
                    />
                </motion.div>
            </AnimatePresence>

            {currentRestaurant && currentRestaurant.floors[currentFloor].places.map((place, placeIndex) => (
                <Controller
                    key={place.id}
                    name='place_id'
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                        <motion.div
                            key={place.id}>
                            <motion.div
                                className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                style={{
                                    left: `${place.xPer}%`,
                                    top: `${place.yPer}%`,
                                }}
                                onClick={() => onClickHandler(place.id, placeIndex)}
                            >

                            </motion.div>

                            <motion.div
                                ref={(el: HTMLDivElement) => seatsRefs.current[placeIndex] = el}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: visibleMenu[place?.id] ? 100 : 0,
                                    height: visibleMenu[place?.id] ? 400 : 0,
                                }}
                                transition={{
                                    duration: .3
                                }}
                                className={`overflow-hidden absolute w-[300px] bg-white rounded-xl `}
                                style={{
                                    left: `${place?.xPer}%`,
                                    top: `${place?.yPer}%`,
                                }}
                            >
                                <motion.div
                                    initial={{ width: '100%' }}
                                    transition={{
                                        duration: .3
                                    }}
                                    className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                >
                                </motion.div>

                                <motion.div
                                    className={`${styles.place_card}`}
                                >
                                    <h3 className={`${styles.place_heading}`}>{place?.name}</h3>

                                    <p className={`${styles.place_description}`}>{place?.description}</p>

                                    <p className="text-black self-start">Мест: {place?.number_of_seats}</p>

                                    <div className="relative w-full h-28">
                                        <Image
                                            src={`http://localhost:3000/${place?.image}`}
                                            alt="design"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded"
                                        />
                                    </div>
                                    {place?.status ? (
                                        <p className="text-black">Столик занят</p>
                                    ) : (
                                        <button
                                            className={`${styles.orange_button}`}
                                            type="button"
                                            disabled={seatsIsSelected ? true : false}
                                            onClick={() => {
                                                field.onChange(place?.id);
                                                ChangeSeatState(true);
                                            }}
                                        >
                                            Выбрать
                                        </button>
                                    )}
                                </motion.div>

                            </motion.div>
                        </motion.div>
                    )}
                >
                </Controller>
            ))}
        </motion.div>
    )
}
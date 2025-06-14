'use client';

import { useCheckUserRole } from "@/lib/hooks/useCheckRole";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { ChangeSeatsStatus, Floors, Places } from "@/lib/interfaces/mockup";
import { useEffect, useRef, useState } from "react";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Image from "next/image";
import { Header } from "@/app/components/header";
import { useRouter } from "next/navigation";
import { supabase } from "@/db/supabaseConfig";

export default function SeatsControl() {

    const { register, control, handleSubmit, formState: { errors } } = useForm()

    const [newValues, setNewValues] = useState<{ [key: string]: boolean }>({});

    const router = useRouter();

    const { userRole } = useCheckUserRole();
    const { restaurants } = useRestaurants();
    const [currentRestaurant, setCurrentRestaurant] = useState<Places>();

    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [maxFloors, setMaxFloors] = useState<number>(1);

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});

    const constraintsRef = useRef<HTMLDivElement>(null);
    const seatsRefs = useRef<HTMLDivElement[]>([]);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // useEffect(() => {
    //     if (userRole !== 'waitstaff' || userRole !== 'admin') {
    //         router.push('/');
    //     };
    // }, [userRole, router]);

    useEffect(() => {
        setCurrentRestaurant(restaurants[0]);
        setMaxFloors(restaurants[0]?.floors.length);
    }, [restaurants]);

    const changeRestaurantHandler = (restaurantIndex: number) => {
        setCurrentRestaurant(restaurants[restaurantIndex]);
        setCurrentFloor(0);
        setMaxFloors(restaurants[restaurantIndex]?.floors.length);
    }

    const onClickHandler = (index: string, placeIndex: number) => {
        setVisibleMenu((prev) => {
            if (prev[index] === true) {
                return {
                    ...prev,
                    [index]: !prev[index]
                }
            } else {
                const container = constraintsRef.current?.getBoundingClientRect();
                const space = seatsRefs.current[placeIndex]?.getBoundingClientRect();

                if (container && space) {
                    if (space.right + space.width > (container.left + container.right) && (space.top + 400) > window.innerHeight) {
                        seatsRefs.current[placeIndex].style.transform = 'translate(-100%, -100%)';
                        return {
                            ...prev,
                            [index]: !prev[index]
                        }
                    }

                    if (space.top + 400 > window.innerHeight) {
                        seatsRefs.current[placeIndex].style.transform = 'translateY(-94%)';
                        return {
                            ...prev,
                            [index]: !prev[index]
                        }
                    } else {
                        seatsRefs.current[placeIndex].style.transform = 'translateY(0)';
                        return {
                            ...prev,
                            [index]: !prev[index]
                        }
                    }
                } else {
                    return {
                        ...prev,
                        [index]: !prev[index]
                    }
                }
            }
        })
    }

    const prevFloorHandler = () => {
        if (currentFloor + 1 > 1) setCurrentFloor(prev => prev -= 1);
        y.set(20);
        x.set(-1500);
    }

    const nextFloorHandler = () => {
        if (currentFloor + 1 < maxFloors) setCurrentFloor(prev => prev += 1);
        y.set(-20)
        x.set(1500);
    }

    const onSubmit = (data) => {
        if (process.env.NEXT_PUBLIC_ENV === 'production') {

            const newArray = Object.entries(newValues)

            newArray.flatMap(async (item) => {
                const { error } = await supabase
                    .from('places')
                    .update({
                        status: item[1]
                    })
                    .eq('id', item[0]);
                if (error) console.error(error);
            })
        }
    }

    return (
        <div className="flex justify-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />
            <div className="flex flex-col items-center gap-4 pt-4">
                <div className="max-w-[760px] w-full flex flex-col items-center gap-2 py-2 bg-[rgba(255,166,133,0.8)] rounded-2xl text-black px-6">
                    <h3 className="uppercase">рестораны</h3>
                    <div className="flex flex-row gap-4">
                        {restaurants.map((restaurant, restaurantIndex) => (
                            <button type="button" key={restaurant.id} onClick={() => changeRestaurantHandler(restaurantIndex)} className={`w-[160px] h-[50px] flex items-center justify-center border-2 border-[#ff8f66] bg-[#ff8f66] rounded-lg transform transition-colors duration-300 ease-in-out ${currentRestaurant?.id === restaurant.id ? 'bg-black text-[#ff8f66]' : ''} cursor-pointer`}>
                                <p>{restaurant.restaurant_name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-[260px] h-[70px] flex flex-row items-center justify-center gap-3 bg-white rounded-xl px-4 mx-auto">
                    <p className="text-black text-xl uppercase">этаж</p>
                    <AnimatePresence mode='wait'>
                        <motion.span
                            key={currentFloor}
                            initial={{
                                y: y.get(),
                                opacity: 0,
                            }}
                            exit={{
                                y: y.get(),
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}

                            transition={{
                                duration: .3
                            }}

                            className="inline-block w-[40px] text-black text-center text-4xl uppercase align-text-top"
                        >
                            {currentFloor + 1}
                        </motion.span>
                    </AnimatePresence>

                    <div className="flex flex-row gap-2">
                        <button type="button" onClick={prevFloorHandler} className="relative w-[45px] h-[45px] flex justify-center items-center transform transition-colors ease-in-out duration-300 bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer">
                            <p className="absolute top-0">&lt;</p>
                        </button>

                        <button type="button" onClick={nextFloorHandler} className="relative w-[45px] h-[45px] flex justify-center items-center bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer">
                            <p className="absolute top-0">&gt;</p>
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <motion.div
                        ref={constraintsRef}
                        className={`relative mx-auto`}
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
                                            className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30 `}
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
                                                className={`flex flex-col items-center`}
                                            >
                                                <h3 className="text-black ">{place?.name}</h3>

                                                <p className="text-black">{place?.description}</p>

                                                <p className="text-black">{place?.number_of_seats}</p>

                                                <div className="relative w-full h-28">
                                                    <Image
                                                        src={`http://localhost:3000/${place?.image}`}
                                                        alt="design"
                                                        layout="fill"
                                                        objectFit="cover"
                                                    />
                                                </div>
                                            </motion.div>


                                            <input {...register('status')} onChange={(e) => {
                                                setNewValues(prev => {
                                                    return {
                                                        ...prev,
                                                        [place.id]: e.target.checked
                                                    }
                                                })
                                                field.onChange(place.id)
                                            }} type="checkbox" />
                                        </motion.div>
                                    </motion.div>
                                )}
                            >
                            </Controller>
                        ))}
                    </motion.div>
                    <button type="submit">СОХРАНИТЬ</button>
                </form>
            </div>
        </div>
    )
}
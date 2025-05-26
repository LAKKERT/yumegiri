'use client';
import { Header } from "@/app/components/header";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/db/supabaseConfig";
import { Restaurant } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";

const validationForm = Yup.object().shape({
    name: Yup.string().required('Поле должно быть заполнено'),
    booked_date: Yup.date().required('Поле должно быть заполнено'),
    phone_number: Yup.string().required('Поле должно быть заполнено'),
    restaurant_id: Yup.number().required("Выбирете ресторан"),
    place_id: Yup.number().required("Выбирете столик")
})

export default function ReservationPage() {
    const [restaurantIsSelected, setRestaurantIsSelected] = useState<{ id: number, index: number } | null>(null);
    const { restaurants } = useRestaurants();
    const [restaurantDetail, setRestaurantDetail] = useState<Restaurant>();
    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [visibleMenu, setVisibleMenu] = useState<{ [key: number]: boolean }>({});
    const constraintsRef = useRef<HTMLDivElement>(null);

    const seatsRefs = useRef<HTMLDivElement[]>([]);

    const { control, register, handleSubmit, formState: { errors } } = useForm<Reservation>({
        resolver: yupResolver(validationForm)
    });

    useEffect(() => {
        if (restaurantIsSelected) setRestaurantDetail(restaurants[restaurantIsSelected?.index]);
    }, [restaurantIsSelected])

    const onSubmit = async (data: Reservation) => {
        try {
            if (process.env.NEXT_PUBLIC_ENV === 'production') {
                const { error } = await supabase
                    .from('guests')
                    .insert({
                        name: data.name,
                        phone_number: data.phone_number,
                        place_id: data.place_id,
                        booked_date: data.booked_date,
                        restaurant_id: data.restaurant_id,
                    })

                    if (error) console.error(error);
            } else {
                const response = await fetch(`/api/restaurant/addReservationAPI`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
    
                if (!response.ok) {
                    console.error('Server side Error');
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onClickHandler = (index: number, placeIndex: number) => {
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
                        seatsRefs.current[placeIndex].style.transform = 'translateY(-100%)';
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
                }else {
                    return {
                        ...prev,
                        [index]: !prev[index]
                    }
                }
            }
        })
    }

    return (
        <div className="mt-[100px] min-h-[calc(100vh-100px)] h-full w-full flex justify-center bg-[#e4c3a2] px-2 font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <button type="button" className="absolute left-5 cursor-pointer z-50" onClick={() => {
                    setRestaurantIsSelected(null)
                }}>BACK</button>
                <div className="h-full w-full flex flex-col items-center">
                    <div className="w-full max-w-[1110px] flex flex-wrap justify-center gap-4">
                        {restaurants.map((restaurant, restaurantIndex) => {
                            return (
                                <Controller
                                    key={restaurant.id}
                                    name='restaurant_id'
                                    control={control}
                                    render={({ field }) => (
                                        <motion.div
                                            animate={{
                                                display: restaurantIsSelected ? 'none' : 'block',
                                                transition: {
                                                    delay: .5
                                                }
                                            }}
                                            className={`w-[250px] h-[350px] text-black bg-white rounded-2xl cursor-pointer transform transition-all duration-500 origin-top ${restaurantIsSelected ? 'opacity-0 ' : 'opacity-100'}`}

                                            onClick={() => {
                                                field.onChange(restaurant.id);
                                                setRestaurantIsSelected({id: restaurant.id, index: restaurantIndex});
                                            }}
                                        >
                                            <div>
                                                <p>{restaurant.name}</p>
                                                <p>{restaurant.description}</p>
                                                <Image
                                                    src={`http://localhost:3000/${restaurant.cover}`}
                                                    alt="Restaurant cover"
                                                    fill
                                                />
                                                
                                            </div>
                                        </motion.div>
                                    )}
                                >
                                </Controller>
                            )
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: .8, display: 'none' }}
                        animate={{
                            display: restaurantIsSelected ? 'flex' : 'none',
                            scale: restaurantIsSelected ? 1 : .8,
                            opacity: restaurantIsSelected ? 100 : 0
                        }}
                        transition={{
                            duration: .3,
                            delay: .5
                        }}
                        className={`absolute w-full max-w-[1110px] flex flex-col items-center gap-5 `}
                    >

                        <input type="number" className="text-black" onChange={(e) => setCurrentFloor(Number(e.target.value))} />

                        <div className="flex flex-col items-center gap-4 max-w-[730px] max-h-[420px] p-4 bg-white text-black rounded-2xl text-lg">
                            <input type="text" {...register('name')} placeholder="Имя фамелия" />
                            <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                            <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                            <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                        </div>

                        <motion.div
                            ref={constraintsRef}
                            className="relative mx-auto bg-gray-100"
                            style={{
                                width: 1110,
                                height: `${restaurantDetail?.floors[currentFloor].mockup_height}px`
                            }}
                        >

                            <Image
                                src={`http://localhost:3000/${restaurantDetail?.floors[currentFloor].mockup}`}
                                alt="mockup"
                                fill
                                className="h-auto w-full"
                            />

                            {restaurantDetail && restaurantDetail.floors[currentFloor].places.map((place, placeIndex) => (
                                <Controller
                                    key={place.id}
                                    name="place_id"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <motion.div key={place.id}>
                                            <motion.div
                                                className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                                style={{
                                                    left: `${place.x}%`,
                                                    top: `${place.y}%`,
                                                    transform: 'translate(-50%, -50%)'
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
                                                    left: `${place?.x}%`,
                                                    top: `${place?.y}%`,
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
                                                    <h3 className="text-black ">{place?.place_name}</h3>

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

                                                    <button
                                                        className="text-black cursor-pointer"
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(place?.id)
                                                        }}
                                                    >
                                                        выбрать
                                                    </button>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                >
                                </Controller>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </form>
        </div>
    )
}
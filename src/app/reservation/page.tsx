'use client';
import { Header } from "@/app/components/header";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { motion } from "framer-motion";
import { div } from "motion/react-client";

const validationForm = Yup.object().shape({
    name: Yup.string().required('Поле должно быть заполнено'),
    booked_date: Yup.date().required('Поле должно быть заполнено'),
    number_of_guests: Yup.number(),
    phone_number: Yup.string().required('Поле должно быть заполнено'),
    restaurant_id: Yup.number().required("Выбирете ресторан"),
    place_Id: Yup.number().required("Выбирете столик")
})

interface formInterface {
    name: string;
    booked_date: Date;
    number_of_guests?: number;
    phone_number: string;
    restaurant_id: number;
    place_Id: number;
}

interface restaurantInterface {
    id: number;
    place_name: string;
    description: string;
    number_of_seats: number;
    image: string;
    x: number;
    y: number;
}

export default function ReservationPage() {

    const [restaurants, setRestaurants] = useState<restaurantInterface[]>([]);
    const [placeDetail, setPlaceDetail] = useState<string | null>(null);
    const [visibleMenu, setVisibleMenu] = useState<{ [key: number]: boolean }>({})
    const constraintsRef = useRef<HTMLDivElement>(null);

    const { control, register, handleSubmit, formState: { errors }, setValue } = useForm<formInterface>({
        resolver: yupResolver(validationForm)
    });

    useEffect(() => {
        const getRestaurants = async () => {
            try {
                const response = await fetch(`/api/restaurant/getRestaurantAPI`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setRestaurants(result.data);
                    setVisibleMenu((prev) => {
                        const newArray: Record<number, boolean> = {};
                        result.data.map((item) => {
                            newArray[item.id] = false;
                        });
                        return newArray
                    })
                } else {
                    console.error('error occured');
                }

            } catch (error) {
                console.error(error)
            }
        };

        getRestaurants();
    }, [])

    console.log(restaurants)
    console.log(visibleMenu)

    const onSubmit = async (data: formInterface) => {
        console.log('data', data)
        try {
            const response = await fetch(`/api/restaurant/addReservationAPI`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                console.log('SUCCESS')
            } else {
                console.error('Server side Error');
            }

        } catch (error) {
            console.error(error)
        }
    }

    const onClickHandler = (index: number) => {
        setVisibleMenu(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="min-h-[calc(100vh-100px)] h-full w-full flex flex-col items-center bg-[#e4c3a2] px-2">
                    {restaurants.map((item) => (
                        <Controller
                            key={item.id}
                            name='restaurant_id'
                            control={control}
                            render={({ field }) => (
                                <motion.div
                                    // initial={{  }}
                                    whileHover={{
                                        width: '100%',
                                        height: '100%',
                                        transition: {
                                            duration: 1
                                        }

                                    }}
                                    className=" absolute w-[350px] h-[350px] bg-cyan-400 rounded-2xl cursor-pointer"
                                // onClick={}
                                >

                                    <motion.div
                                        
                                    >
                                        <div className="max-w-[730px] max-h-[420px] bg-amber-950">
                                            <input type="text" {...register('name')} placeholder="Имя фамелия" />
                                            <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                                            <input type="text" {...register('number_of_guests')} placeholder="Количество гостей" />
                                            <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                                            <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                                        </div>

                                        <div ref={constraintsRef}
                                            className="relative h-[1000px] w-[1000px] my-50 border-2 border-red-300"
                                        >
                                            <Image
                                                src={'/restaurant mockup/mockup.png'}
                                                layout="fill"
                                                alt="mockup"
                                                className="user-none"
                                            />

                                            {restaurants.map((item) => (
                                                <Controller
                                                    key={item.id}
                                                    name="place_Id"
                                                    control={control}
                                                    defaultValue={0}
                                                    render={({ field }) => (
                                                        <motion.div key={item.id}>
                                                            <motion.div
                                                                className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                                                style={{
                                                                    x: item.x,
                                                                    y: item.y,
                                                                }}
                                                                onClick={() => onClickHandler(item.id)}
                                                            >

                                                            </motion.div>

                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{
                                                                    opacity: visibleMenu[item.id] ? 100 : 0
                                                                }}
                                                                transition={{
                                                                    duration: .3
                                                                }}
                                                                className={`overflow-hidden absolute w-[300px] h-[400px] bg-white rounded-xl`}
                                                                style={{
                                                                    x: item.x,
                                                                    y: item.y,
                                                                }}
                                                            >
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: visibleMenu[item.id] ? '100%' : 0 }}
                                                                    transition={{
                                                                        duration: .3
                                                                    }}
                                                                    className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                                                >
                                                                </motion.div>

                                                                <motion.div
                                                                    className={`flex flex-col items-center`}
                                                                >
                                                                    <h3 className="text-black">{item.place_name}</h3>

                                                                    <p className="text-black">{item.description}</p>

                                                                    <p className="text-black">{item.number_of_seats}</p>

                                                                    <div className="relative w-full h-28">
                                                                        <Image
                                                                            src={`http://localhost:3000/${item.image}`}
                                                                            alt="design"
                                                                            layout="fill"
                                                                            objectFit="cover"
                                                                        />
                                                                    </div>

                                                                    <button
                                                                        className="text-black"
                                                                        type="button"
                                                                        onClick={() => {
                                                                            field.onChange(item.id)
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
                                        </div>
                                    </motion.div>

                                </motion.div>
                            )}
                        >

                        </Controller>
                    ))}

                    {/* <div className="max-w-[730px] max-h-[420px] bg-amber-950">
                        <input type="text" {...register('name')} placeholder="Имя фамелия" />
                        <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                        <input type="text" {...register('number_of_guests')} placeholder="Количество гостей" />
                        <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                        <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                    </div>

                    <div ref={constraintsRef}
                        className="relative h-[1000px] w-[1000px] my-50 border-2 border-red-300"
                    >
                        <Image
                            src={'/restaurant mockup/mockup.png'}
                            layout="fill"
                            alt="mockup"
                            className="user-none"
                        />

                        {restaurants.map((item) => (
                            <Controller
                                key={item.id}
                                name="place_Id"
                                control={control}
                                defaultValue={0}
                                render={({ field }) => (
                                    <motion.div key={item.id}>
                                        <motion.div
                                            className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                            style={{
                                                x: item.x,
                                                y: item.y,
                                            }}
                                            onClick={() => onClickHandler(item.id)}
                                        >

                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: visibleMenu[item.id] ? 100 : 0
                                            }}
                                            transition={{
                                                duration: .3
                                            }}
                                            className={`overflow-hidden absolute w-[300px] h-[400px] bg-white rounded-xl`}
                                            style={{
                                                x: item.x,
                                                y: item.y,
                                            }}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: visibleMenu[item.id] ? '100%' : 0 }}
                                                transition={{
                                                    duration: .3
                                                }}
                                                className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                            >
                                            </motion.div>

                                            <motion.div
                                                className={`flex flex-col items-center`}
                                            >
                                                <h3 className="text-black">{item.place_name}</h3>

                                                <p className="text-black">{item.description}</p>

                                                <p className="text-black">{item.number_of_seats}</p>
                                                
                                                <div className="relative w-full h-28">
                                                    <Image 
                                                        src={`http://localhost:3000/${item.image}`}
                                                        alt="design" 
                                                        layout="fill"
                                                        objectFit="cover"  
                                                    />
                                                </div>

                                                <button
                                                    className="text-black"
                                                    type="button"
                                                    onClick={() => {
                                                        field.onChange(item.id)
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
                    </div> */}
                </div >
            </form >
        </div >
    )
}
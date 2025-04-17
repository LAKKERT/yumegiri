'use client';
import { Header } from "@/app/components/header";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { delay, motion } from "framer-motion";

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
    name: string;
    description: string;
    address: number;
    phone_number: string;
    mockup: string;
    mockup_height: number;
    mockup_width: number;
}

interface mockupInterface {
    mockup: string;
    mockup_height: number;
    mockup_width: number;
}

interface seatsInterface {
    id: number;
    place_name: string;
    description: string;
    number_of_seats: number;
    restaurant_id: number;
    image: string;
    x: number;
    y: number;
}

export default function ReservationPage() {

    const [restaurantIsSelected, setRestaurantIsSelected] = useState<number | null>(null);
    const [restaurants, setRestaurants] = useState<restaurantInterface[]>([]);
    const [mockup, setMockup] = useState<mockupInterface>();
    const [places, setPlaces] = useState<seatsInterface[]>([]);
    const [restaurantDetail, setRestaurantDetail] = useState<seatsInterface[]>([]);
    const [visibleMenu, setVisibleMenu] = useState<{ [key: number]: boolean }>({});
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
                    setRestaurants(result.restaurantData);
                    setPlaces(result.placesData);
                    setVisibleMenu((prev) => {
                        const newArray: Record<number, boolean> = {};
                        result.placesData.map((item) => {
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

    console.log(restaurants, places)
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

    console.log('restaurantDetail', restaurantDetail)

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="min-h-[calc(100vh-100px)] h-full w-full flex flex-row justify-center bg-[#e4c3a2] px-2 pt-5">
                    <div className="w-full max-w-[1110px] flex justify-center gap-4">

                        {restaurants.map((item) => {
                            console.log('item', item)
                            return (
                                <Controller
                                    key={item.id}
                                    name='restaurant_id'
                                    control={control}
                                    render={({ field }) => (
                                        <motion.div>
                                            <div>
                                                <motion.div
                                                    animate={{
                                                        display: restaurantIsSelected ? 'none' : 'block',
                                                        transition: {
                                                            delay: .5
                                                        }
                                                    }}
                                                    className={`w-[250px] h-[350px] text-black bg-white rounded-2xl cursor-pointer transform transition-all duration-500 origin-top ${restaurantIsSelected ? 'opacity-0 ' : 'opacity-100'}`}

                                                    onClick={() => {
                                                        field.onChange(item.id);
                                                        setMockup({
                                                            mockup: item.mockup,
                                                            mockup_width: item.mockup_width,
                                                            mockup_height: item.mockup_height
                                                        });
                                                        setRestaurantIsSelected(item.id);
                                                        setRestaurantDetail(() => {
                                                            const newArray = places.filter((place) => place.restaurant_id === item.id);
                                                            console.log('newArray', newArray);
                                                            return newArray;
                                                        });
                                                    }}
                                                >
                                                    <div className={`${restaurantIsSelected === item.id ? 'opacity-0' : 'opacity-100'}`}>
                                                        <p>{item.name}</p>
                                                        <p>{item.description}</p>
                                                    </div>
                                                </motion.div>

                                            </div>
                                        </motion.div>
                                    )}
                                >
                                </Controller>
                            )
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            scale: restaurantIsSelected ? 1 : 0,
                            opacity: restaurantIsSelected ? 100 : 0
                        }}
                        transition={{
                            duration: .3,
                            delay: .5
                        }}
                        className={`w-full max-w-[1110px] flex flex-col items-center gap-5 `}
                    >

                        <div className="max-w-[730px] max-h-[420px] bg-amber-950">
                            <input type="text" {...register('name')} placeholder="Имя фамелия" />
                            <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                            <input type="text" {...register('number_of_guests')} placeholder="Количество гостей" />
                            <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                            <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                        </div>

                        <motion.div ref={constraintsRef}
                            className="relative mx-auto bg-gray-100"
                            style={{
                                width: `${mockup?.mockup_width}px`,
                                height: `${mockup?.mockup_height}px`
                            }}
                        >


                            <Image
                                src={`http://localhost:3000/${mockup?.mockup}`}
                                alt="mockup"
                                fill
                                className="h-auto w-full object-contain"
                            />

                            {restaurantDetail && restaurantDetail.map((place) => (
                                <Controller
                                    key={place.id}
                                    name="place_Id"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field }) => (
                                        <motion.div key={place.id}>
                                            <motion.div
                                                className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                                style={{
                                                    left: `${place?.x}%`,
                                                    top: `${place?.y}%`,
                                                }}
                                                onClick={() => onClickHandler(place.id)}
                                            >

                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: visibleMenu[place?.id] ? 100 : 0
                                                }}
                                                transition={{
                                                    duration: .3
                                                }}
                                                className={`overflow-hidden absolute w-[300px] h-[400px] bg-white rounded-xl`}
                                                style={{
                                                    left: `${place?.x}%`,
                                                    top: `${place?.y}%`,
                                                }}
                                            >
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: visibleMenu[place?.id] ? '100%' : 0 }}
                                                    transition={{
                                                        duration: .3
                                                    }}
                                                    className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                                >
                                                </motion.div>

                                                <motion.div
                                                    className={`flex flex-col items-center`}
                                                >
                                                    <h3 className="text-black">{place?.place_name}</h3>

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
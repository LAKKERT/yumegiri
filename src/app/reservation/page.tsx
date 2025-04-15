'use client';
import { Header } from "@/app/components/header";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { motion } from "framer-motion";

const validationForm = Yup.object().shape({
    name: Yup.string().required('Поле должно быть заполнено'),
    booked_date: Yup.date().required('Поле должно быть заполнено'),
    number_of_guests: Yup.number().required('Поле должно быть заполнено'),
    phone_number: Yup.string().required('Поле должно быть заполнено'),
    place_Id: Yup.string()
    // place_Id: Yup.string().required("Выбирете столик")
})

interface formInterface {
    name: string;
    booked_date: Date;
    number_of_guests: number;
    phone_number: string;
    place_Id: string | null; // number
}

interface restoranInterface {
    id: number;
    name: string;
    description: string;
    number_of_seats: number;
    x: number;
    y: number;
}

export default function ReservationPage() {

    const [restorans, setRestorans] = useState<restoranInterface[]>([]);
    const [placeDetail, setPlaceDetail] = useState<string | null>(null);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<formInterface>({
        resolver: yupResolver(validationForm),
    });

    useEffect(() => {
        const getRestorans = async () => {
            try {
                const response = await fetch(`/api/menu/getRestoransAPI`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setRestorans(result.data);
                } else {
                    console.error('error occured');
                }

            } catch (error) {
                console.error(error)
            }
        };

        getRestorans();
    }, [])

    console.log(restorans)

    const onSubmit = async (data: formInterface) => {
        console.log(data)
    }

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="min-h-[calc(100vh-100px)] h-full w-full flex flex-col items-center bg-[#e4c3a2] px-2">
                    <div className="max-w-[730px] max-h-[420px] bg-amber-950">
                        <input type="text" {...register('name')} placeholder="Имя фамелия" />
                        <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                        <input type="text" {...register('number_of_guests')} placeholder="Количество гостей" />
                        <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                        <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                    </div>

                    {/* <div>
                        <div className={`w-7 h-7 rounded-full cursor-pointer bg-white`} onClick={() => {
                            setPlaceDetail('Place 1')
                        }}>

                        </div>
                    </div>

                    <div>
                        <div className={`w-7 h-7 rounded-full cursor-pointer bg-white`} onClick={() => {
                            setPlaceDetail('Place 2')
                        }}>

                        </div>
                    </div> */}

                    <div ref={constraintsRef}
                        className="relative h-[1000px] w-[1000px] my-50 border-2 border-red-300"
                    >
                        <Image
                            src={'/restaurant mockup/mockup.png'}
                            fill
                            alt="mockup"
                            className="user-none"
                        />

                        {restorans.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                style={{
                                    x: item.x,
                                    y: item.y,
                                }}
                            >

                            </motion.div>
                        ))}
                    </div>



                    <div className={`w-[450px] h-[450px] bg-white ${placeDetail !== null ? 'block' : 'hidden'}`}>
                        <p className="text-black">{placeDetail}</p>

                        <button className={`text-black cursor-pointer`} onClick={() => setPlaceDetail(null)} >close</button>

                        <button className={`text-black cursor-pointer`} onClick={() => {
                            setValue('place_Id', placeDetail)
                        }}>
                            select place
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
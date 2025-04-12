'use client';
import { Header } from "@/app/components/header";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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

export default function ReservationPage() {

    const [placeDetail, setPlaceDetail] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<formInterface>({
        resolver: yupResolver(validationForm),
    });

    const onSubmit = async (data: formInterface) => {
        console.log(data)
    }

    return (
        <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="min-h-[calc(100vh-100px)] w-full flex flex-col items-center bg-[#e4c3a2] px-2">
                    <div className="max-w-[730px] max-h-[420px] bg-amber-950">
                        <input type="text" {...register('name')} placeholder="Имя фамелия" />
                        <input type="date" {...register('booked_date')} placeholder="Дата и время" />
                        <input type="text" {...register('number_of_guests')} placeholder="Количество гостей" />
                        <input type="text" {...register('phone_number')} placeholder="Номер телефона" />
                        <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                    </div>

                    <div>
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
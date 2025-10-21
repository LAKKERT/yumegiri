'use client';
import { Header } from "@/app/components/header";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { Places } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";
import { MainInfo } from "@/app/components/restaurant/mainInformation";
import { FloorCounter } from "@/app/components/restaurant/floorCounter";
import { RestaurantMockUp } from "@/app/components/restaurant/RestaurantMockUp";
import { supabase } from "@/db/supabaseConfig";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import moment from "moment";
import Loader from "../components/loader";
import Image from "next/image";

export default function Restaurants() {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [dataIsFetched, setDataIsFetched] = useState(false);
    const [canvasIsReady, setCanvasIsReady] = useState(false);

    const { register, handleSubmit } = useForm<Reservation>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { control: editFormControl, handleSubmit: editFormSubmit, reset: resetEditForm, setValue: setEditFormValue } = useForm<Places>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            cover: null,
            gallery: null,
            floors: [],
        },
    });
    const { update } = useFieldArray({
        control: editFormControl,
        name: 'floors',
    });

    const { restaurants } = useRestaurants();
    const [currentRestaurant, setCurrentRestaurant] = useState<Places>();

    const [selectedSeat, setSelectedSeat] = useState<string>("");
    const [seatIsSelected, setSeatIsSelected] = useState<boolean>(false);

    const [order, setOrder] = useState<number>(0);
    const [isBooked, setIsBooked] = useState<boolean>(false);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: carouselRef });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    const constraintsRef = useRef<HTMLDivElement>(null);

    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [maxFloors, setMaxFloors] = useState<number>(1);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const [isSwitchingFloor, setIsSwitchingFloor] = useState<boolean>(false);

    useEffect(() => {
        setCurrentRestaurant(restaurants[0]);
        setMaxFloors(restaurants[0]?.floors.length);
    }, [restaurants]);

    useEffect(() => {
        resetEditForm({
            restaurant_name: currentRestaurant?.restaurant_name,
            description: currentRestaurant?.description,
            address: currentRestaurant?.address,
            phone_number: currentRestaurant?.phone_number,
            cover: currentRestaurant?.cover,
            floors: currentRestaurant?.floors,
        });
    }, [currentRestaurant, resetEditForm])

    useEffect(() => {
        if (order + 1 === currentRestaurant?.gallery?.length) {
            setIsLastImage(true);
        } else {
            setIsLastImage(false);
        }
    }, [order, currentRestaurant])

    useEffect(() => {
        if (!carouselRef.current) return

        const previousCards = Array.from({ length: order });
        const widths = previousCards.map((_, index) => index === order ? 275 : 250);

        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        carouselRef.current.scrollLeft = totalWidth + order * 8;
    }, [order])

    function useScrollOverflowMask(scrollXProgress: MotionValue<number>) {
        const left = `0%`
        const right = `100%`
        const leftInset = `5%`
        const rightInset = `95%`
        const transparent = `#0000`
        const opaque = `#000`
        const maskImage = useMotionValue(
            `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
        )

        useMotionValueEvent(scrollXProgress, "change", (value) => {
            if (value === 0) {
                animate(
                    maskImage,
                    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
                )
            } else if (value === 1) {
                animate(
                    maskImage,
                    `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`
                )
            } else if (
                scrollXProgress.getPrevious() === 0 ||
                scrollXProgress.getPrevious() === 1
            ) {
                animate(
                    maskImage,
                    `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`
                )
            }
        })

        return maskImage
    }

    const prevFloorHandler = () => {
        if (currentFloor + 1 > 1) setCurrentFloor(prev => prev -= 1);
        y.set(20);
        x.set(-1500);
        setIsSwitchingFloor(true);
    }

    const nextFloorHandler = () => {
        if (currentFloor + 1 < maxFloors) setCurrentFloor(prev => prev += 1);
        y.set(-20)
        x.set(1500);
        setIsSwitchingFloor(true);
    }

    const changeRestaurantHandler = (restaurantIndex: number) => {
        const timeOut = setTimeout(() => {
            setOrder(0);
            carouselRef.current?.scrollTo({
                left: 0,
                behavior: 'instant',
            });
            return timeOut;
        }, 300);
        setCurrentRestaurant(restaurants[restaurantIndex]);
        setCurrentFloor(0);
        setMaxFloors(restaurants[restaurantIndex]?.floors.length);
    }

    const prevImageHandler = () => {
        if (order + 1 > 1) setOrder(prev => prev -= 1);
        else return;
    }

    const nextImageHandler = () => {
        if (!currentRestaurant?.gallery) return
        if (order + 1 < currentRestaurant?.gallery?.length) setOrder(prev => prev += 1);
    }

    const onSubmit = async (data: Reservation) => {
        if (process.env.NEXT_PUBLIC_ENV === 'production') {

            const now = moment();

            const reservedUntil = now.add(30, 'minutes');

            const bookedUntil = now.add(2, 'hours');

            const reservedUntilISO = reservedUntil.toISOString();
            const bookedUntilISO = bookedUntil.toISOString();

            const { error: bookedErrors } = await supabase
                .from('guests')
                .insert({
                    name: data.name,
                    phone_number: data.phone_number,
                    booked_date: bookedUntilISO,
                    expires_at: reservedUntilISO,
                    restaurant_id: currentRestaurant?.id,
                    table_id: selectedSeat,
                })
            if (bookedErrors) console.error(bookedErrors);
            else {
                const { error: tableErrors } = await supabase
                    .from('tables')
                    .update({
                        status: true
                    })
                    .eq('id', selectedSeat)
                if (tableErrors) console.error(tableErrors)
                else {
                    setIsBooked(true);
                }
            }
        }
    };

    const changeSelectedSeat = (seatID: string) => {
        setSelectedSeat(seatID);
    };

    const ChangeSeatState = (mode: boolean) => {
        setSeatIsSelected(mode);
    };

    const changeSwithichFloorHandler = (mode: boolean) => {
        setIsSwitchingFloor(mode);
    };

    const changeIsLoading = () => {
        setCanvasIsReady(true);
    };

    useEffect(() => {
        if (restaurants) {
            setDataIsFetched(true);
        }
    }, [restaurants]);

    useEffect(() => {
        if (canvasIsReady && dataIsFetched) {
            console.log(canvasIsReady, dataIsFetched)
            setIsLoading(false);
        }
    }, [canvasIsReady, dataIsFetched])

    return (
        <div className="relative flex justify-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />

            <div className={`fixed w-full z-30 pointer-events-none`} >
                <Loader isLoading={isLoading} />
            </div>

            <Image className="absolute left-0 z-0" alt="cloud" width={220} height={120} src={`/restaurant mockup/cloud5.png`} />

            <Image className="absolute right-20 top-15 z-0 -scale-x-100" alt="cloud" width={220} height={120} src={`/restaurant mockup/cloud5.png`} />

            <Image className="absolute right-40 top-75 z-0" alt="cloud" width={220} height={120} src={`/restaurant mockup/cloud7.png`} />

            <div className={`flex flex-col items-center ${isLoading ? "opacity-0" : 'opacity-100'}`}>
                {/* {userRole === 'admin' || userRole === 'waiter' ? (
                    <RestaurantToolBar changeEditMode={changeEditMode} restaurantId={currentRestaurant?.id} />
                ) : (
                    null
                )} */}
                <motion.div
                    initial={{
                        backgroundColor: 'transparent'
                    }}
                    animate={{
                        backgroundColor: seatIsSelected ? '#0000006c' : 'transparent',
                    }}
                    className={`fixed w-full min-h-[calc(100vh-100px)] duration-300 ${seatIsSelected ? ' z-50' : ''}`}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col items-center py-4 px-10 text-black rounded text-lg w-full max-w-[450px] bg-[#ffa685] ${seatIsSelected ? 'z-50' : 'hidden z-0 select-none'} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 `}>
                        <div className={`w-full text-center flex flex-col gap-4 ${isBooked ? 'hidden' : ''}`}>
                            <button type="button" className={`self-start ${styles.reservation_form_button}`} onClick={() => setSeatIsSelected(false)}>вернуться</button>
                            <div className="w-full p-2 bg-white rounded">
                                <p className={`text-[#D57F7E] font-[family-name:var(--font-arimo)]`}>Обратите внимание: ваш столик будет ожидать вас в течение 30 минут после подтверждения.
                                    Если вы не успеете прийти, бронь автоматически освободится для других гостей.
                                </p>
                            </div>
                            <div className="relative">
                                <input id="name" {...register('name')} className={`${styles.user_data_fields} font-[family-name:var(--font-arimo)]`} placeholder=" " type="text" />
                                <label htmlFor="name" className={`absolute left-1 top-0 ${styles.user_data_label} font-[family-name:var(--font-arimo)]`}>Имя</label>
                            </div>

                            <div className="relative">
                                <input id="phone_number" {...register('phone_number')} className={`${styles.user_data_fields} font-[family-name:var(--font-arimo)]`} placeholder=" " type="text" />
                                <label htmlFor="phone_number" className={`absolute left-1 top-0 ${styles.user_data_label} font-[family-name:var(--font-arimo)]`}>Номер телефона</label>
                            </div>
                            <button type="submit" className={`mx-auto ${styles.reservation_form_button}`}>ЗАБРОНИРОВАТЬ</button>
                        </div>

                        <div className={`flex flex-col items-center gap-2 ${isBooked ? '' : 'hidden'}`}>
                            <p className="text-white font-[family-name:var(--font-arimo)]">Столик успешно зарезервирован. На ваш телефон в ближайшее время свяжется наш сотрудник для подтверждения бронирования.</p>
                            <button type="button" onClick={() => {
                                setIsBooked(false);
                                setSeatIsSelected(false);
                                router.push('/');
                            }}
                                className={`cursor-pointer uppercase ${styles.reservation_form_button}`} >
                                хорошо
                            </button>
                        </div>
                    </form>
                </motion.div>

                <div className={`relative max-w-[1110px] h-full w-full flex flex-col gap-4 items-center`}>
                    <div className="max-w-[760px] w-full flex flex-col items-center gap-2 py-2 rounded-2xl text-black px-6">
                        <p className="text-lg text-center text-balance text-white uppercase font-[family-name:var(--font-jura)] [text-shadow:0_4px_4px_rgb(0_0_0_/_0.5)]">Выберите кафе и место на схеме кафе, которое хотите зарезервировать. <br />И заполните форму.</p>
                        <div className="flex flex-wrap gap-4">
                            {restaurants.map((restaurant, restaurantIndex) => (
                                <button type="button" key={restaurant.id} disabled={seatIsSelected ? true : false} onClick={() => changeRestaurantHandler(restaurantIndex)} className={`w-[160px] h-[50px] flex items-center justify-center border-2 border-[#ff8f66] bg-[#ff8f66] rounded-lg transform transition-colors duration-300 ease-in-out ${currentRestaurant?.id === restaurant.id ? 'bg-black text-[#ff8f66]' : ''} cursor-pointer`}>
                                    <p className="">{restaurant.restaurant_name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex flex-row justify-between gap-4">
                        <div className={`w-full flex flex-col gap-2`}>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentRestaurant?.description}
                                    initial={{
                                        filter: 'blur(5px)'
                                    }}
                                    exit={{
                                        filter: 'blur(5px)'
                                    }}
                                    animate={{
                                        filter: 'blur(0px)'
                                    }}
                                    transition={{
                                        duration: .3
                                    }}
                                    className="flex flex-col gap-3 text-center [text-shadow:0_4px_4px_rgb(0_0_0_/_0.5)]"
                                >
                                    <h2 className="text-xl uppercase">{currentRestaurant?.restaurant_name}</h2>
                                    <p className={`text-center text-balance text-2xl font-[family-name:var(--font-jura)]`}>{currentRestaurant?.description}</p>
                                    <span className="text-2xl font-[family-name:var(--font-jura)]">Адрес: {currentRestaurant?.address}</span>
                                    <span className="text-2xl font-[family-name:var(--font-jura)]">Контакты: {currentRestaurant?.phone_number}</span>
                                </motion.div>
                            </AnimatePresence>
                        </div>


                        <MainInfo prevImageHandler={prevImageHandler} nextImageHandler={nextImageHandler} carouselRef={carouselRef} maskImage={maskImage} isLastImage={isLastImage} currentRestaurant={currentRestaurant} order={order} />
                    </div>

                    <FloorCounter prevFloorHandler={prevFloorHandler} nextFloorHandler={nextFloorHandler} currentFloor={currentFloor} maxFloors={maxFloors} y={y} />

                    <p className="text-white text-2xl font-[family-name:var(--font-jura)] [text-shadow:0_4px_4px_rgb(0_0_0_/_0.5)]">Наведите и нажмите, чтобы двигать и масштабировать макет</p>

                    <RestaurantMockUp constraintsRef={constraintsRef} currentRestaurant={currentRestaurant} update={update} currentFloor={currentFloor} changeSelectedSeat={changeSelectedSeat} ChangeSeatState={ChangeSeatState} isSwitchingFloor={isSwitchingFloor} changeSwithichFloorHandler={changeSwithichFloorHandler} changeIsLoading={changeIsLoading} />

                    <button type="submit" className={`cursor-pointer`}>
                        СОХРАНИТЬ
                    </button>
                </div>
            </div>
        </div>
    );
}
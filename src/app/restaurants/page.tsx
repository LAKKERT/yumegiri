'use client';
import { Header } from "@/app/components/header";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { Floors, Places, Seats } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";
import { MainInfo } from "@/app/components/restaurant/mainInformation";
import { RestaurantEditForm, EditRestaurantMockUp } from "@/app/components/restaurant/editRestaurantData";
import { FloorCounter } from "@/app/components/restaurant/floorCounter";
import { RestaurantMockUp } from "@/app/components/restaurant/RestaurantMockUp";
import { saveRestaurantFiles } from '@/helpers/saveImage';
import { supabase } from "@/db/supabaseConfig";
import { processData } from "@/helpers/readFiles";
import { useCheckUserRole } from "@/lib/hooks/useCheckRole";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { RestaurantToolBar } from '@/app/components/restaurant/toolBar';

export default function Restaurants() {
    const { userRole } = useCheckUserRole();

    const { control, register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Reservation>();
    const { control: editFormControl, register: editFormRegister, handleSubmit: editFormSubmit, formState: { editFormErrors }, reset: resetEditForm, setValue: setEditFormValue } = useForm<Places>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            cover: null,
            gallery: null,
            floors: [],
        },
    });
    const { fields, append, remove, update, replace } = useFieldArray({
        control: editFormControl,
        name: 'floors',
    });

    const { restaurants } = useRestaurants();
    const [currentRestaurant, setCurrentRestaurant] = useState<Places>();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const [order, setOrder] = useState<number>(0);
    const [isBooked, setIsBooked] = useState<boolean>(false);
    const [seatsIsSelected, setSeatIsSelected] = useState<boolean>(false);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: carouselRef });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const constraintsRef = useRef<HTMLDivElement>(null);
    const seatsRefs = useRef<HTMLDivElement[]>([]);

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

    const onClickHandler = (index: string, placeIndex: number) => {
        setVisibleMenu((prev) => {
            if (prev[index] === true) {
                return {
                    ...prev,
                    [index]: !prev[index]
                }
            } else {
                if (seatsRefs.current[placeIndex]) {
                    seatsRefs.current[placeIndex].style.transform = 'translate(0, 0)'; // Сбросс позиции

                    const container = constraintsRef.current?.getBoundingClientRect();
                    const space = seatsRefs.current[placeIndex].getBoundingClientRect();

                    if (container && space) {
                        const spaceOnTop = space.top > 400  // Заходит ли меню за пределы верхней стороны
                        const spaceOnBottom = space.top + 400 < window.innerHeight; // Заходит ли меню за пределы нижней стороны
                        const spaceOnRight = space.right < window.innerWidth; // Заходит ли меню за пределы правой стороны

                        if (!spaceOnTop && !spaceOnRight) {
                            seatsRefs.current[placeIndex].style.transform = 'translate(calc(-100% + 10px), 10px)';
                            return {
                                ...prev,
                                [index]: !prev[index]
                            }
                        }
                        else if (!spaceOnBottom) {
                            if (!spaceOnRight) {
                                seatsRefs.current[placeIndex].style.transform = 'translate(calc(-100% + 10px), calc(-100% + 10px))'
                                return {
                                    ...prev,
                                    [index]: !prev[index]
                                }
                            }

                            seatsRefs.current[placeIndex].style.transform = 'translate(10px, calc(-100% + 10px))'
                            return {
                                ...prev,
                                [index]: !prev[index]
                            }
                        }
                        else {
                            if (spaceOnRight) {
                                seatsRefs.current[placeIndex].style.transform = 'translate(0%, 0%)'
                                return {
                                    ...prev,
                                    [index]: !prev[index]
                                }
                            }
                            else {
                                seatsRefs.current[placeIndex].style.transform = 'translate(calc(-100% + 10px), 10px)'
                                return {
                                    ...prev,
                                    [index]: !prev[index]
                                }
                            }
                        }
                    }
                }
                return prev
            }
        })
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
            const { error: bookedErrors } = await supabase
                .from('guests')
                .insert({
                    name: data.name,
                    phone_number: data.phone_number,
                    booked_date: data.booked_date,
                    restaurant_id: currentRestaurant?.id,
                    place_id: data.place_id,
                })
            if (bookedErrors) console.error(bookedErrors);
            else {
                const { error: updateSeatError } = await supabase
                    .from('places')
                    .update({
                        status: true
                    })
                    .eq('id', data.place_id)
                if (updateSeatError) console.error(updateSeatError)
                else {
                    setIsBooked(true);
                }
            }
        }
    };

    const getFileProperties = (files: File[] | File | string | null): string | string[] | null => {
        if (Array.isArray(files)) {
            return files.map(file => {
                if (!file) return null;
                return `/restaurant mockup/${Date.now()}_${file.name}`;
            }).filter(name => name !== null) as string[];
        } else if (files && typeof files === 'object') {
            return `/restaurant mockup/${Date.now()}_${files.name}`;
        } else if (typeof files === 'string') {
            return files;
        } else {
            return null;
        };
    };

    const onSubmitEditForm = async (data: Places) => {
        if (process.env.NEXT_PUBLIC_ENV === 'production') {

            const galleryArray = (data.gallery) instanceof FileList ? Array.from(data.gallery) : [];

            const galleryProperties = galleryArray.map(file => getFileProperties(file));
            const galleryDataPromises = galleryArray.map(file => processData(file));
            const galleryData = await Promise.all(galleryDataPromises);

            const coverProperties = getFileProperties(data.cover);
            const coverData = await processData(data.cover);

            const mockupPropeties = data.floors.map((floor: Floors) => getFileProperties(floor.mockup));
            const mockUpDataPromises = data.floors.map((floor: Floors) => processData(floor.mockup));
            const mockUpData = await Promise.all(mockUpDataPromises);

            const imagesProperty = data.floors.map((floor: Floors) => floor.places.map((seat: Seats) => getFileProperties(seat.image)));
            const imagesDataPromises = data.floors.flatMap((floor: Floors) => floor.places.map((seat: Seats) => processData(seat.image)));
            const imagesPropertyForSave = data.floors.flatMap((floor: Floors) => floor.places.map((seat: Seats) => getFileProperties(seat.image)));
            const imagesData = await Promise.all(imagesDataPromises);

            saveRestaurantFiles(mockUpData, mockupPropeties);
            saveRestaurantFiles(imagesData, imagesPropertyForSave);
            saveRestaurantFiles(coverData, coverProperties);
            saveRestaurantFiles(galleryData, galleryProperties);

            if (galleryProperties.length !== 0) {
                const { error: deleteGallery } = await supabase
                    .from('gallery')
                    .delete()
                    .eq('restaurant_id', currentRestaurant?.id);

                if (deleteGallery) console.error(deleteGallery);
                else {
                    for (let i = 0; i < galleryProperties.length; i++) {
                        const { error: insertError } = await supabase
                            .from('gallery')
                            .insert({
                                image: galleryProperties[i],
                                restaurant_id: currentRestaurant?.id
                            });
                        if (insertError) console.error(insertError);
                    }
                }
            }

            const { error } = await supabase
                .from('restaurant')
                .update({
                    name: data.restaurant_name,
                    address: data.address,
                    phone_number: data.phone_number,
                    description: data.description,
                    cover: coverProperties
                })
                .eq('id', currentRestaurant?.id);

            if (error) console.error(error);
            else {

                const { error: deletePlaces } = await supabase
                    .from('floors')
                    .delete()
                    .eq('restaurant_id', currentRestaurant?.id);

                if (deletePlaces) console.error(deletePlaces);
                else {
                    for (let floorIdx = 0; floorIdx < data.floors.length; floorIdx++) {
                        const { data: floor_id, error: floorError } = await supabase
                            .from('floors')
                            .insert({
                                mockup: mockupPropeties[floorIdx],
                                mockup_height: data.floors[floorIdx].mockup_height,
                                mockup_width: data.floors[floorIdx].mockup_width,
                                level: floorIdx,
                                restaurant_id: currentRestaurant?.id,
                            })
                            .select('uuid')
                            .single();
                        if (floorError) console.error(floorError);
                        else {
                            for (let seatIdx = 0; seatIdx < data.floors[floorIdx].places.length; seatIdx++) {
                                const { error: placesError } = await supabase
                                    .from('places')
                                    .insert({
                                        name: data.floors[floorIdx].places[seatIdx].name,
                                        description: data.floors[floorIdx].places[seatIdx].description,
                                        number_of_seats: data.floors[floorIdx].places[seatIdx].number_of_seats,
                                        x: data.floors[floorIdx].places[seatIdx].x,
                                        y: data.floors[floorIdx].places[seatIdx].y,
                                        xPer: data.floors[floorIdx].places[seatIdx].xPer,
                                        yPer: data.floors[floorIdx].places[seatIdx].yPer,
                                        image: imagesProperty[floorIdx][seatIdx],
                                        floor_id: floor_id.uuid,
                                    });

                                if (placesError) {
                                    console.error(placesError);
                                }
                            }
                        }
                    }
                }
            }
            window.location.reload();
        }
    }

    const changeEditMode = (mode: boolean) => {
        setIsEditMode(mode);
    }

    const ChangeSeatState = (mode: boolean) => {
        setSeatIsSelected(mode);
    }

    const changeSwithichFloorHandler = (mode: boolean) => {
        setIsSwitchingFloor(mode);
        console.log('Changed mode', mode )
    }

    return (
        <div className="flex justify-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] caret-transparent">
            <Header />
            <div className="flex flex-col items-center">
                {userRole === 'admin' || userRole === 'waiter' ? (
                    <RestaurantToolBar changeEditMode={changeEditMode} restaurantId={currentRestaurant?.id} />
                ) : (
                    null
                )}
                <motion.div
                    initial={{
                        backgroundColor: 'transparent'
                    }}
                    animate={{
                        backgroundColor: seatsIsSelected ? '#0000006c' : 'transparent',
                    }}
                    className={`fixed w-full min-h-[calc(100vh-100px)] duration-300 ${seatsIsSelected ? ' z-50' : ''}`}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col items-center p-4 text-black rounded-2xl text-lg w-[350px] max-h-[420px] bg-[#FFA685] ${seatsIsSelected ? 'z-50' : 'hidden z-0 select-none'} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isEditMode ? 'hidden' : ''} `}>
                        <div className={`w-full text-center flex flex-col gap-4 ${isBooked ? 'hidden' : ''}`}>
                            <button type="button" className="self-start cursor-pointer" onClick={() => setSeatIsSelected(false)}>вернуться</button>
                            <p>Заполните форму</p>
                            <input {...register('name')} className={`${styles.user_data_fields} font-[family-name:var(--font-arimo)]`} type="text" placeholder="Имя фамелия" />
                            <input {...register('phone_number')} className={`${styles.user_data_fields} font-[family-name:var(--font-arimo)]`} type="text" placeholder="Номер телефона" />
                            <input {...register('booked_date')} className={`font-[family-name:var(--font-arimo)] cursor-pointer`} type="date" placeholder="Дата и время" />
                            <button type="submit" className="cursor-pointer">ЗАРЕЗИРВИРОВАТЬ</button>
                        </div>

                        <div className={`flex flex-col items-center gap-2 ${isBooked ? '' : 'hidden'}`}>
                            <p>Столик успешно зарезервирован. На ваш телефон в ближайшее время свяжется наш сотрудник для подтверждения бронирования.</p>
                            <button type="button" onClick={() => {
                                setIsBooked(false);
                                setSeatIsSelected(false);
                            }}
                                className="cursor-pointer">
                                хорошо
                            </button>
                        </div>
                    </form>
                </motion.div>

                <form onSubmit={editFormSubmit(onSubmitEditForm)}>
                    <div className={`relative max-w-[1110px] h-full w-full flex flex-col gap-4 items-center`}>
                        <div className="max-w-[760px] w-full flex flex-col items-center gap-2 py-2 rounded-2xl text-black px-6">
                            <p className="text-lg text-center text-balance text-white uppercase">Выберите ресторан и место на схеме ресторана, которое хотите зарезервировать. <br />И заполните форму.</p>
                            <h3 className="uppercase">рестораны</h3>
                            <div className="flex flex-wrap gap-4">
                                {restaurants.map((restaurant, restaurantIndex) => (
                                    <button type="button" key={restaurant.id} disabled={seatsIsSelected ? true : false} onClick={() => changeRestaurantHandler(restaurantIndex)} className={`w-[160px] h-[50px] flex items-center justify-center border-2 border-[#ff8f66] bg-[#ff8f66] rounded-lg transform transition-colors duration-300 ease-in-out ${currentRestaurant?.id === restaurant.id ? 'bg-black text-[#ff8f66]' : ''} cursor-pointer`}>
                                        <p className="">{restaurant.restaurant_name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    setEditFormValue('gallery', files)
                                    const galleryArray = files instanceof FileList ? Array.from(files) : [];
                                    setSelectedImages(galleryArray)
                                }
                            }}
                            className="text-white hidden"
                            type="file"
                            accept="image/*"
                            multiple
                            id={`gallery`}
                        />

                        <label className={`${isEditMode ? '' : 'hidden'}`} htmlFor={`gallery`}>ВЫБРАТЬ ФОТОГРАФИИ</label>

                        <div className="w-full flex flex-row justify-between gap-4">
                            <div className={`w-full flex flex-col gap-2 ${isEditMode ? 'hidden' : ''}`}>
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
                                        className="flex flex-col gap-3 text-center"
                                    >
                                        <h2 className="text-xl uppercase">{currentRestaurant?.restaurant_name}</h2>
                                        <p className={`text-center text-balance text-3xl font-[family-name:var(--font-marck)]`}>{currentRestaurant?.description}</p>
                                        <span className="text-2xl font-[family-name:var(--font-marck)]">Адрес: {currentRestaurant?.address}</span>
                                        <span className="text-2xl font-[family-name:var(--font-marck)]">Контакты: {currentRestaurant?.phone_number}</span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className={`${isEditMode ? 'block' : 'hidden'}`}>
                                <RestaurantEditForm register={editFormRegister} />
                            </div>

                            <MainInfo prevImageHandler={prevImageHandler} nextImageHandler={nextImageHandler} carouselRef={carouselRef} maskImage={maskImage} isLastImage={isLastImage} selectedImages={selectedImages} isEditMode={isEditMode} currentRestaurant={currentRestaurant} order={order} />
                        </div>

                        <FloorCounter prevFloorHandler={prevFloorHandler} nextFloorHandler={nextFloorHandler} currentFloor={currentFloor} maxFloors={maxFloors} seatsIsSelected={seatsIsSelected} isEditMode={isEditMode} y={y}/>

                        {isEditMode && currentRestaurant ? (
                            <EditRestaurantMockUp restaurantDetail={currentRestaurant} register={editFormRegister} fields={fields} append={append} remove={remove} update={update} replace={replace} />
                        ) : (
                            <RestaurantMockUp constraintsRef={constraintsRef} currentRestaurant={currentRestaurant} currentFloor={currentFloor} seatsIsSelected={seatsIsSelected} control={control} seatsRefs={seatsRefs} visibleMenu={visibleMenu} x={x} ChangeSeatState={ChangeSeatState} onClickHandler={onClickHandler} isSwitchingFloor={isSwitchingFloor} changeSwithichFloorHandler={changeSwithichFloorHandler} />
                        )}

                        <button type="submit" className={`cursor-pointer ${isEditMode ? '' : 'hidden'}`}>
                            СОХРАНИТЬ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
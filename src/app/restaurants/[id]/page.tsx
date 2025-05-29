'use client';

import React from 'react';
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from '@/app/components/header';
import { supabase } from '@/db/supabaseConfig';
import { useParams } from "next/navigation";
import { Floors, Places, Seats } from '@/lib/interfaces/mockup';
import { useForm, useFieldArray } from 'react-hook-form';
import { RestaurantEditForm, EditRestaurantMockUp } from '@/app/components/restaurant/editRestaurantData';
import { saveRestaurantFiles } from '@/helpers/saveImage';

export default function RestaurantDetail() {
    const params = useParams();

    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [restaurantDetail, setRestaurantDetail] = useState<Places>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const constraintsRef = useRef<HTMLDivElement>(null);
    const seatsRefs = useRef<HTMLDivElement[]>([]);

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<Places>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            cover: null,
            floors: [],
        },
    })

    const { fields, append, remove, update, replace } = useFieldArray({
        control,
        name: 'floors'
    })

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

    const processData = (file: File | File[] | string | null): Promise<string | string[] | null> => {
        if (Array.isArray(file)) {
            return Promise.all(
                file.map((singleFile) =>
                    new Promise((resolve, reject) => {
                        if (!singleFile) resolve(null);
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(singleFile);
                    })
                )
            ) as Promise<string[] | null>;
        } else {
            if (file && typeof file === 'object') {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(file);
                });
            } else {
                return Promise.resolve(null);
            }
        }
    };

    useEffect(() => {
        if (!params) {
            return
        }

        const getRestaurantDetail = async () => {
            try {
                if (process.env.NEXT_PUBLIC_ENV === 'production') {
                    const { data, error } = await supabase
                        .from('restaurant')
                        .select(`
                            id,
                            restaurant_name: name,
                            address,
                            phone_number,
                            description,
                            cover,
                            floors (
                                uuid,
                                mockup,
                                mockup_height,
                                mockup_width,
                                level,
                                restaurant_id,
                                places (
                                    id,
                                    visible,
                                    name,
                                    description,
                                    status,
                                    number_of_seats,
                                    image,
                                    x,
                                    y,
                                    xPer,
                                    yPer,
                                    floor_id
                                )
                            )
                        `)
                        .eq('id', params.id)
                        .single();

                    if (error) console.error(error);
                    else {
                        setRestaurantDetail(data);
                        reset({
                            restaurant_name: data.restaurant_name,
                            description: data.description,
                            address: data.address,
                            phone_number: data.phone_number,
                            cover: data.cover,
                            floors: data.floors,
                        });
                    }

                } else {
                    const response = await fetch(`/api/restaurant/getRestaurantDetail`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'id': `${params.id}`,
                        },
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setRestaurantDetail(result.restaurant);
                    } else {
                        console.error('error fetching data');
                    }
                }
            } catch (error) {
                console.error('Error fetch restaurants', error);
            }
        }

        getRestaurantDetail()
    }, [params])

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

    const onSubmit = async (data: Places) => {
        if (process.env.NEXT_PUBLIC_ENV === 'production') {

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

            const { error } = await supabase
                .from('restaurant')
                .delete()
                .eq('id', params?.id)

            if (error) console.error(error);
            else {
                const { data: restaurant_id, error } = await supabase
                    .from('restaurant')
                    .insert({
                        name: data.restaurant_name,
                        description: data.description,
                        address: data.address,
                        phone_number: data.phone_number,
                        cover: coverProperties
                    })
                    .select('id')
                    .single();

                if (error) {
                    console.error(error);
                } else {
                    for (let floorIdx = 0; floorIdx < data.floors.length; floorIdx++) {
                        const { data: floor_id, error: floorError } = await supabase
                            .from('floors')
                            .insert({
                                mockup: mockupPropeties[floorIdx],
                                mockup_height: data.floors[floorIdx].mockup_height,
                                mockup_width: data.floors[floorIdx].mockup_width,
                                level: floorIdx,
                                restaurant_id: restaurant_id.id,
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
        }
    }

    return (
        <div className="mt-[100px] min-h-[calc(100vh-100px)] h-full w-full flex justify-center bg-[#e4c3a2] px-2 font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
                <motion.div
                    className={`h-full w-full max-w-[1110px] flex flex-col items-center gap-5 `}
                >
                    <button type='button' onClick={() => setIsEditMode(prev => !prev)}>Редактировать</button>

                    <div className={`flex flex-col items-center ${isEditMode ? 'hidden' : 'flex'}`}>
                        <h2>{restaurantDetail?.restaurant_name}</h2>
                        <p>{restaurantDetail?.description}</p>
                        <span>{restaurantDetail?.address}</span>
                        <span>{restaurantDetail?.phone_number}</span>
                    </div>

                    <div className={`flex flex-col items-center ${isEditMode ? 'flex' : 'hidden'}`}>
                        <RestaurantEditForm register={register} setValue={setValue} />
                    </div>

                    <input type="number" defaultValue={currentFloor + 1} min={1} max={restaurantDetail?.floors.length} className={`text-black ${isEditMode ? 'hidden' : 'flex'}`} onChange={(e) => setCurrentFloor(Number(e.target.value) - 1)} />

                    <motion.div
                        ref={constraintsRef}
                        className={`relative mx-auto bg-gray-100 ${isEditMode ? 'hidden' : 'flex'}`}
                        style={{
                            width: 1110,
                            height: `${restaurantDetail?.floors[currentFloor].mockup_height}px`
                        }}
                    >

                        <Image
                            src={`http://localhost:3000/${restaurantDetail?.floors[currentFloor].mockup}`}
                            alt="mockup"
                            fill
                            className={`h-auto w-full `}
                        />

                        {restaurantDetail && restaurantDetail.floors[currentFloor].places.map((place, placeIndex) => (
                            <motion.div
                                key={place.id}>
                                <motion.div
                                    className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30 `}
                                    style={{
                                        left: `${place.xPer}%`,
                                        top: `${place.yPer}%`,
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
                                </motion.div>

                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div
                        className={`w-full max-w-[1110px] flex flex-col items-center gap-4 ${isEditMode ? 'flex' : 'hidden'}`}
                    >
                        {restaurantDetail ? (
                            <div className='w-full'>
                                <EditRestaurantMockUp restaurantDetail={restaurantDetail} register={register} fields={fields} append={append} remove={remove} update={update} replace={replace} />
                                <button type='submit'>Принять изменения</button>
                            </div>
                        ) : (
                            null
                        )}
                    </motion.div>
                </motion.div>

            </form>
        </div>
    )
}
'use client';

import React from 'react';
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from '@/app/components/header';

export default function RestaurantDetail({ params }: { params: { id: number } }) {

    const [restaurantDetail, setRestaurantDetail] = useState<RestaurantInterface>();
    const [places, setPlaces] = useState<SeatsInterface[]>([]);

    const [visibleMenu, setVisibleMenu] = useState<{ [key: number]: boolean }>({});
    const constraintsRef = useRef<HTMLDivElement>(null);

    const paramsValue = React.use(params as unknown as React.Usable<{ id: number }>);

    useEffect(() => {
        setVisibleMenu(() => {
            const newArray: Record<number, boolean> = {};
            places?.map((item: SeatsInterface) => {
                newArray[item.id] = false;
            });
            return newArray
        })
    }, [places])

    useEffect(() => {
        const getRestaurantDetail = async () => {
            try {
                const response = await fetch(`/api/restaurant/getRestaurantDetail`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'id': `${paramsValue.id}`,
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setRestaurantDetail(result.restaurant);
                    setPlaces(result.places);
                } else {
                    console.log('error fetching data');
                }

            } catch (error) {
                console.error('Error fetch restaurants', error);
            }
        }

        getRestaurantDetail()
    }, [params])

    const onClickHandler = (index: number) => {
        setVisibleMenu(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    console.log(restaurantDetail, places)

    return (
        <div className="mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <div className="relative min-h-[calc(100vh-100px)] h-full w-full flex flex-row justify-center bg-[#e4c3a2] px-2 pt-5">
                <motion.div
                    className={`absolute w-full max-w-[1110px] flex flex-col items-center gap-5 `}
                >

                    {/* <motion.div ref={constraintsRef}
                        className="relative mx-auto bg-gray-100"
                        style={{
                            width: `${restaurantDetail?.mockup_width}px`,
                            height: `${restaurantDetail?.mockup_height}px`
                        }}
                    >

                        <Image
                            src={`http://localhost:3000/${restaurantDetail?.mockup}`}
                            alt="mockup"
                            fill
                            className="h-auto w-full object-contain"
                        />

                        {places && places.map((place) => (

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
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div> */}
                </motion.div>
            </div>
        </div>
    )
}
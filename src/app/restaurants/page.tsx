'use client';
import { Header } from "@/app/components/header";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { Gallery, Places } from "@/lib/interfaces/mockup";

export default function Restaurants() {

    const { restaurants } = useRestaurants();
    const [currentRestaurant, setCurrentRestaurant] = useState<Places>();
    const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState<number>(0);

    const [order, setOrder] = useState<number>(0);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: carouselRef })
    const maskImage = useScrollOverflowMask(scrollXProgress)

    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const constraintsRef = useRef<HTMLDivElement>(null);
    const seatsRefs = useRef<HTMLDivElement[]>([]);

    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [maxFloors, setMaxFloors] = useState<number>(1);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        setCurrentRestaurant(restaurants[0]);
        setCurrentRestaurantIndex(0)
        setMaxFloors(restaurants[0]?.floors.length);
    }, [restaurants]);

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
    }

    const nextFloorHandler = () => {
        if (currentFloor + 1 < maxFloors) setCurrentFloor(prev => prev += 1);
        y.set(-20)
        x.set(1500);
    }

    const chageRestaurantHandler = (restaurantIndex: number) => {
        const timeOut = setTimeout(() => {
            setOrder(0);
            carouselRef.current?.scrollTo({
                left: 0,
                behavior: 'instant',
            });
            return timeOut;
        }, 300);
        setCurrentRestaurant(restaurants[restaurantIndex]);
        setCurrentRestaurantIndex(restaurantIndex);
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
                } else {
                    return {
                        ...prev,
                        [index]: !prev[index]
                    }
                }
            }
        })
    }

    return (
        <div className="flex justify-center mt-[100px] font-[family-name:var(--font-pacifico)] min-h-[calc(100vh-100px)] bg-[#e4c3a2] caret-transparent">
            <Header />
            <div className="relative max-w-[1110px] h-full w-full flex flex-col gap-4 items-center px-2 pt-5">

                <div className="flex flex-col items-center gap-4 max-w-[730px] max-h-[420px] p-4 bg-white text-black rounded-2xl text-lg">
                    <input type="text" placeholder="Имя фамелия" />
                    <input type="text" placeholder="Номер телефона" />
                    <input type="date" placeholder="Дата и время" />  
                </div>

                <div className="max-w-[760px] w-full flex flex-col items-center gap-2 py-2 bg-white rounded-2xl text-black px-6">
                    <h3 className="uppercase">рестораны</h3>
                    <div className="flex flex-row gap-4">
                        {restaurants.map((restaurant, restaurantIndex) => (
                            <button key={restaurant.id} onClick={() => chageRestaurantHandler(restaurantIndex)} className={`w-[160px] h-[50px] flex items-center justify-center border-2 border-[#ff8f66] bg-[#ff8f66] rounded-lg transform transition-colors duration-300 ease-in-out ${currentRestaurant?.id === restaurant.id ? 'bg-black text-[#ff8f66]' : ''} cursor-pointer`}>
                                <p>{restaurant.restaurant_name}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full flex flex-row justify-between gap-4">
                    <div className="w-full flex flex-col gap-2">
                        <AnimatePresence mode='wait'>
                            <motion.div key={currentRestaurant?.description}>
                                <motion.div
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
                                    className="text-center text-xl uppercase"
                                >
                                    <h2>{currentRestaurant?.restaurant_name}</h2>
                                </motion.div>
                                <motion.div
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
                                    className="text-lg"
                                >
                                    <p>{currentRestaurant?.description}</p>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <button
                            type="button"
                            className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                            onClick={() => setOrder(prev => prev -= 1)}
                        >
                            &lt;
                        </button>
                        <motion.div ref={carouselRef}
                            style={{
                                maskImage,
                                paddingRight: isLastImage ? "" : `${(200 * 2)}px`,
                                width: isLastImage ? `250px` : `650px`
                            }}
                            className={`snap-x scroll-smooth flex flex-row items-center gap-4 overflow-hidden overflow-x-hidden transform transition-all duration-300`}
                        >
                            <AnimatePresence mode='wait'>
                                {Array.isArray(currentRestaurant?.gallery) ? (
                                    currentRestaurant?.gallery.map((image, index) => (
                                        <motion.div
                                            key={image.id}
                                            id={`image${index}`}
                                            className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'} ${order === index ? 'w-[275px] h-[335px]' : 'min-w-[250px] w-[250px] h-[310px]'} rounded-xl`}
                                            initial={{
                                                y: 80,
                                                opacity: 0
                                            }}
                                            exit={{
                                                y: -80,
                                                opacity: 0,
                                                background: '#000'
                                            }}

                                            animate={{
                                                y: 0,
                                                opacity: 100,
                                                background: '#000'
                                            }}
                                            transition={{
                                                duration: .3,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Image
                                                src={image.image}
                                                alt="restaurant gallery"
                                                fill
                                                objectFit="cover"
                                                className={`rounded-xl origin-center`}
                                            >

                                            </Image>
                                        </motion.div>
                                    ))
                                ) : (
                                    null
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <button
                            type="button"
                            className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                            onClick={() => setOrder(prev => prev += 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="w-[260px] h-[70px] flex flex-row items-center justify-center gap-3 bg-white rounded-xl px-4">
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


                    <motion.div
                        ref={constraintsRef}
                        className={`relative mx-auto ${isEditMode ? 'hidden' : 'flex'}`}
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
                                </motion.div>

                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div >
        </div >
    );
}
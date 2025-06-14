'use client';
import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useRef, useCallback, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { saveRestaurantFiles } from "@/helpers/saveImage";
import { useRouter } from "next/navigation";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { Places } from "@/lib/interfaces/mockup";
import { supabase } from "@/db/supabaseConfig";

export default function AddMockUP() {
    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const [order, setOrder] = useState<number>(0);
    const [mockUPUrl, setMockUPUrl] = useState<string | null>(null);
    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    const { scrollXProgress } = useScroll({ container: carouselRef });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    const [countOfFloors, setCountOfFloors] = useState<number>(1);

    const seatsRefs = useRef<HTMLDivElement[]>([]);
    const pointsRefs = useRef<HTMLDivElement[]>([]);
    const constraintsRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

    const y = useMotionValue(0);
    const x = useMotionValue(0);

    const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<Places>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            cover: null,
            floors: [{
                uuid: uuidv4(),
                mockup: null,
                mockup_height: 0,
                mockup_width: 0,
                places: []
            }],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'floors',
    });


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

    const addFloor = () => {
        setCountOfFloors(prev => prev + 1);
        const idv4 = uuidv4();
        const seatidv4 = uuidv4();
        append({
            uuid: idv4,
            mockup: null,
            mockup_height: 0,
            mockup_width: 0,
            places: [
                {
                    id: seatidv4,
                    description: '',
                    name: '',
                    image: null,
                    number_of_seats: 1,
                    status: false,
                    x: 0,
                    y: 0,
                    xPer: 0,
                    yPer: 0,
                    visible: false,
                }
            ]
        });

        setVisibleMenu((prev) => ({ ...prev, [seatidv4]: false }));
    };

    const addSeat = (currentFloor: number) => {
        if (fields && currentFloor >= 0 && currentFloor < fields.length) {
            const idv4 = uuidv4();
            update(currentFloor, {
                ...fields[currentFloor],
                places: [
                    ...fields[currentFloor].places,
                    {
                        id: idv4,
                        name: '',
                        description: '',
                        number_of_seats: 1,
                        image: null,
                        status: false,
                        x: 0,
                        y: 0,
                        xPer: 0,
                        yPer: 0,
                        visible: false,
                    }
                ]
            });
        } else {
            console.warn('Invalid currentFloor or fields is empty');
        }
    };

    const getFileProperties = (files: File[] | File | null): string | string[] | null => {
        if (Array.isArray(files)) {
            return files.map(file => {
                if (!file) return null;
                return `/restaurant mockup/${Date.now()}_${file.name}`;
            }).filter(name => name !== null) as string[];
        } else if (files) {
            return `/restaurant mockup/${Date.now()}_${files.name}`;
        } else {
            return null;
        };
    };

    const processData = (file: File | File[] | null): Promise<string | string[] | null> => {
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
            if (file) {
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

    const onSubmit = async (data: Places) => {
        try {
            const galleryArray = (data.gallery) instanceof FileList ? Array.from(data.gallery) : [];

            const galleryProperties = galleryArray.map(file => getFileProperties(file));
            const galleryDataPromises = galleryArray.map(file => processData(file));
            const galleryData = await Promise.all(galleryDataPromises);

            const mockupPropeties = data.floors.map(floor => getFileProperties(floor.mockup));
            const imagesProperty = data.floors.map(floor => floor.places.map(seat => getFileProperties(seat.image)));
            const imagesPropertyForSave = data.floors.flatMap(floor => floor.places.map(seat => getFileProperties(seat.image)));
            const coverProperties = getFileProperties(data.cover);

            const coverData = await processData(data.cover);

            const mockUpDataPromises = data.floors.map(floor => processData(floor.mockup));
            const mockUpData = await Promise.all(mockUpDataPromises);

            const imagesDataPromises = data.floors.flatMap(floor => floor.places.map(seat => processData(seat.image)));
            const imagesData = await Promise.all(imagesDataPromises);

            saveRestaurantFiles(mockUpData, mockupPropeties);
            saveRestaurantFiles(imagesData, imagesPropertyForSave);
            saveRestaurantFiles(coverData, coverProperties);
            saveRestaurantFiles(galleryData, galleryProperties);

            const payload = {
                ...data,
            };

            if (process.env.NEXT_PUBLIC_ENV === 'production') {
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
                    for (let i = 0; i < galleryProperties.length; i++) {
                        const { error: galleryError } = await supabase
                            .from('gallery')
                            .insert({
                                image: galleryProperties[i],
                                restaurant_id: restaurant_id.id
                            })
                        if (galleryError) console.error(galleryError);
                    }


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
                                };
                            };
                        };
                    };
                };
            } else {
                const response = await fetch(`/api/restaurant/addRestaurantMockUp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    router.push('/');
                } else {
                    console.error('Error occured');
                }
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSeat = (seatID: string) => {
        let updatedPlaces = [...fields[currentFloor].places]
        updatedPlaces = updatedPlaces.filter((item) => item.id !== seatID)

        update(currentFloor, {
            ...fields[currentFloor],
            places: updatedPlaces
        })

        setVisibleMenu((prev) => {
            const newArray = { ...prev };
            delete newArray[seatID];
            return newArray;
        });
    };

    const handleDeleteFloor = () => {
        remove(currentFloor);

        if (visibleMenu) {
            setVisibleMenu((prev) => {
                const newArray = { ...prev }
                fields[currentFloor].places.map(place => delete newArray[place.id])
                return newArray
            })
        }

        setCountOfFloors(prev => prev - 1);
    }

    const prevImageHandler = () => {
        if (order + 1 > 1) setOrder(prev => prev -= 1);
        else return;
    }

    const nextImageHandler = () => {
        if (order + 1 < selectedImages.length) setOrder(prev => prev += 1);
    }


    const handleDragElement = useCallback((info: { point: { x: number; y: number }; delta: { x: number; y: number }; velocity: { x: number; y: number } }, currentFloor: number, fieldIndex: number, index: string) => {
        if (!constraintsRef.current) return;
        const container = constraintsRef.current.getBoundingClientRect();
        const element = pointsRefs.current[fieldIndex].getBoundingClientRect();

        if (container) {
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            const relativeX = (element.x - container.left) - scrollX;
            const relativeY = (element.y - container.top);

            const relativeXPercent = Math.max(0, Math.min(100, (relativeX / container.width) * 100));
            const relativeYPercent = Math.max(0, Math.min(100, (relativeY / container.height) * 100));

            update(currentFloor, {
                ...fields[currentFloor],
                places: [
                    ...fields[currentFloor].places.slice(0, fieldIndex),
                    {
                        ...fields[currentFloor].places[fieldIndex],
                        x: Math.round(relativeX),
                        y: Math.round(relativeY),
                        xPer: Math.round(relativeXPercent * 10) / 10,
                        yPer: Math.round(relativeYPercent * 10) / 10,
                    },
                    ...fields[currentFloor].places.slice(fieldIndex + 1)
                ]
            });

            setVisibleMenu((prev) => {
                if (seatsRefs.current[fieldIndex]) {
                    const container = constraintsRef.current?.getBoundingClientRect();
                    const space = seatsRefs.current[fieldIndex].getBoundingClientRect();
                    const viewPortY = element.y - scrollY;

                    if (container && space) {
                        if (element.x + space.width > (container.left + container.right) && (viewPortY + 400) > window.innerHeight) {
                            seatsRefs.current[fieldIndex].style.transform = 'translate(-100%, -100%)';
                            return {
                                ...prev,
                                [index]: true
                            }
                        }

                        if (viewPortY + 400 > window.innerHeight) {
                            seatsRefs.current[fieldIndex].style.transform = 'translateY(-100%)';
                            return {
                                ...prev,
                                [index]: true
                            }
                        } else {
                            seatsRefs.current[fieldIndex].style.transform = 'translateY(0)';
                            return {
                                ...prev,
                                [index]: true
                            }
                        }
                    }
                }
            })
        }
    }, [constraintsRef, fields]);

    const handleCloseMenu = (itemUUID: string) => {
        setVisibleMenu(prev => ({ ...prev, [itemUUID]: false }));
    };

    useEffect(() => {
        const changeFloor = async () => {
            if (fields[currentFloor] && fields[currentFloor].mockup !== null) {
                try {
                    const imageData = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(fields[currentFloor].mockup as File);
                    });

                    setMockUPUrl(imageData);
                } catch (error) {
                    console.error('Ошибка загрузки изображения:', error);
                }
            } else {
                setMockUPUrl(null);
            }
        };

        changeFloor();
    }, [currentFloor, fields]);

    const onClickHandler = (index: string, placeIndex: number) => {
        setVisibleMenu((prev) => {
            if (typeof prev === 'undefined') return
            if (prev[index] === true) {
                return {
                    ...prev,
                    [index]: !prev[index]
                }
            } else {
                if (seatsRefs.current[placeIndex]) {
                    const container = constraintsRef.current?.getBoundingClientRect();
                    const space = seatsRefs.current[placeIndex].getBoundingClientRect();

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
            }
        })
    }

    useEffect(() => {
        if (!carouselRef.current) return

        const previousCards = Array.from({ length: order });
        const widths = previousCards.map((_, index) => index === order ? 275 : 250);

        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        carouselRef.current.scrollLeft = totalWidth + order * 8;
    }, [order])

    const selectedMockUP = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            try {
                const imageData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(files[0]);
                });

                setMockUPUrl(imageData);

                const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
                    const img = document.createElement('img');
                    img.onload = () => {
                        resolve({
                            width: img.naturalWidth,
                            height: Math.round(Math.min(img.naturalHeight * (1110 / img.naturalWidth), 1200))
                        });
                    };
                    img.src = imageData;
                });

                update(index, {
                    ...fields[index],
                    mockup: files[0],
                    mockup_height: dimensions.height,
                    mockup_width: dimensions.width,
                });

            } catch (error) {
                console.error('Ошибка загрузки:', error);
            }
        }
    };

    const setSeatImage = (seatIndex: number, file: File) => {
        update(currentFloor, {
            ...fields[currentFloor],
            places: [
                ...fields[currentFloor].places.slice(0, seatIndex),
                {
                    ...fields[currentFloor].places[seatIndex],
                    image: file,
                },
                ...fields[currentFloor].places.slice(seatIndex + 1)
            ]
        })
    }

    const prevFloorHandler = () => {
        if (currentFloor + 1 > 1) setCurrentFloor(prev => prev -= 1);
        y.set(20);
        x.set(-1500);
    }

    const nextFloorHandler = () => {
        if (currentFloor + 1 < countOfFloors) setCurrentFloor(prev => prev += 1);
        y.set(-20)
        x.set(1500);
    }

    return (
        <div className="flex justify-center min-h-[calc(100vh-100px)] h-full bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)} className="relative max-w-[1110px] h-full w-full flex flex-col gap-4 items-center px-2 pt-5">
                <div className="flex flex-row gap-4 w-full max-h-[420px] p-4 text-white rounded-2xl text-lg">
                    {/* <input
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setValue('cover', file)
                            }
                        }}
                        className="text-white hidden"
                        type="file"
                        accept="image/*"
                        id={`cover`}
                    />
                    <label htmlFor={`cover`}>ВЫБРАТЬ ОБЛОЖКУ</label> */}

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-col">
                            <span className={`${styles.advice} font-[family-name:var(--font-kiwimaru)]`}>название</span>
                            <input {...register('restaurant_name')} className={`${styles.reservation_inputs}`} type="text" placeholder="НАЗВАНИЕ" />
                        </div>

                        <div className="flex flex-col">
                            <span className={`${styles.advice} font-[family-name:var(--font-kiwimaru)]`}>описание</span>
                            <textarea
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;

                                    target.style.height = "auto";
                                    target.style.minHeight = "40px";
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                                {...register('description')}
                                className={`${styles.reservation_inputs} overflow-y-hidden font-[family-name:var(--font-marck)]`}
                                placeholder="ОПИСАНИЕ"
                            />
                        </div>

                        <div className="flex flex-col">
                            <span className={`${styles.advice} font-[family-name:var(--font-kiwimaru)]`}>адрес</span>
                            <input {...register('address')} className={`${styles.reservation_inputs} font-[family-name:var(--font-marck)]`} type="text" placeholder="АДРЕСС" />
                        </div>

                        <div className="flex flex-col">
                            <span className={`${styles.advice} font-[family-name:var(--font-kiwimaru)]`}>контакты</span>
                            <input {...register('phone_number')} className={`${styles.reservation_inputs} font-[family-name:var(--font-marck)]`} type="text" placeholder="НОМЕР ТЕЛЕФОНА" />
                        </div>

                    </div>

                    <div className="w-full">
                        <div className="text-center text-nowrap">
                            <input
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                        setValue('gallery', files);
                                        const galleryArray = files instanceof FileList ? Array.from(files) : []
                                        setSelectedImages(galleryArray);
                                    }
                                }}
                                className="text-white hidden"
                                type="file"
                                accept="image/*"
                                multiple
                                id={`gallery`}
                            />

                            <label htmlFor={`gallery`}>ВЫБРАТЬ ФОТОГРАФИИ</label>
                        </div>

                        <div className={`flex flex-row items-center gap-4 ${selectedImages.length === 0 ? 'hidden' : ''}`}>
                            <button
                                type="button"
                                className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                                onClick={prevImageHandler}
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
                                    {selectedImages.map((image, index) => (
                                        <motion.div
                                            key={index}
                                            id={`image${index}`}
                                            className={`relative snap-start bg-white shrink-0 transform-3d  ${isLastImage ? 'scroll-ml-0' : 'scroll-ml-4'} ${order === index ? 'w-[275px] h-[335px]' : 'min-w-[250px] w-[250px] h-[310px]'} rounded-md`}
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
                                                src={URL.createObjectURL(selectedImages[index])}
                                                alt="restaurant gallery"
                                                fill
                                                objectFit="cover"
                                                className={`rounded-md origin-center`}
                                            >

                                            </Image>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                            <button
                                type="button"
                                className="w-[25px] h-[25px] bg-white rounded-full text-black cursor-pointer"
                                onClick={nextImageHandler}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    onChange={(e) => selectedMockUP(e, currentFloor)}
                    className="text-white hidden"
                    type="file"
                    accept="image/*"
                    id={`mockUP-${currentFloor}`}
                />
                <label htmlFor={`mockUP-${currentFloor}`} className={`${styles.restaurant_button}`}>{mockUPUrl ? 'ИЗМЕНИТЬ ЧЕРТЁЖ' : 'ВЫБРАТЬ ЧЕРТЁЖ'}</label>
                <div className={`flex flex-col items-center gap-4`}>
                    <div className={`flex flex-row gap-5`}>
                        <button type="button" onClick={addFloor} className={`${styles.restaurant_button}`}>Добавить этаж</button>
                        <button type="button" onClick={handleDeleteFloor} className={`${styles.delete_button} bg-red-400`}>Удалить этаж</button>
                    </div>

                    <div className={`w-auto h-[70px] flex flex-row items-center justify-center gap-3 bg-white rounded-xl px-4`}>
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

                                className="inline-block w-[40px] text-black text-center text-4xl uppercase align-text-top pb-2"
                            >
                                {currentFloor + 1}
                            </motion.span>
                        </AnimatePresence>

                        <span className="text-black text-xl uppercase">из</span>
                        <span className="inline-block w-[40px] text-black text-center text-4xl uppercase align-text-top pb-2">{countOfFloors}</span>

                        <div className="flex flex-row gap-2">
                            <button type="button" onClick={prevFloorHandler} className="relative w-[45px] h-[45px] flex justify-center items-center transform transition-colors ease-in-out duration-300 bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer">
                                <p className="absolute top-0">&lt;</p>
                            </button>

                            <button type="button" onClick={nextFloorHandler} className="relative w-[45px] h-[45px] flex justify-center items-center bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer">
                                <p className="absolute top-0">&gt;</p>
                            </button>
                        </div>
                    </div>
                </div>

                <button type="button" onClick={() => addSeat(currentFloor)} className={`${styles.restaurant_button}`}>ДОБАВИТЬ МЕСТО</button>

                <motion.div
                    ref={constraintsRef}
                    className={`relative mx-auto max-w-[1110px] bg-gray-100`}
                    style={{ width: 1110, height: fields[currentFloor]?.mockup_height }}
                >
                    {mockUPUrl ? (
                        <div>
                            <Image
                                src={mockUPUrl || ""}
                                alt="mockup"
                                fill
                                priority
                                className="h-auto w-full"
                            />
                        </div>
                    ) : (
                        null
                    )}

                    {(fields.length > 0 && fields[currentFloor] && fields[currentFloor].mockup && fields[currentFloor].places && fields[currentFloor].places.length > 0) && fields[currentFloor].places.map((field, fieldIndex) => (
                        <motion.div key={field.id}>
                            <motion.div
                                ref={(el: HTMLDivElement) => {
                                    if (el) {
                                        pointsRefs.current[fieldIndex] = el;
                                    }
                                }}
                                key={field.id}
                                className="absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-50 cursor-move"
                                drag
                                whileDrag={{ scale: 0.8, cursor: 'grabbing' }}
                                dragConstraints={constraintsRef}
                                dragTransition={{ power: 0, timeConstant: 0 }}
                                dragMomentum={false}
                                style={{ x: field.x, y: field.y }}
                                onDragEnd={(event: unknown, info: { point: { x: number; y: number }; delta: { x: number; y: number }; velocity: { x: number; y: number } }) => handleDragElement(info, currentFloor, fieldIndex, field.id)}
                                onDragStart={() => {
                                    setVisibleMenu(prev => ({ ...prev, [field.id]: false }));
                                }}
                                onClick={() => onClickHandler(field.id, fieldIndex)}
                            >
                                <motion.div
                                    className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[30px] h-[30px] rounded-full bg-transparent outline-3 outline-orange-500 z-30"
                                >

                                </motion.div>
                            </motion.div>

                            <motion.div
                                ref={(el: HTMLDivElement) => {
                                    if (el) {
                                        seatsRefs.current[fieldIndex] = el
                                    }
                                }
                                }
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: visibleMenu[field.id] ? 100 : 0,
                                    height: visibleMenu[field.id] ? 400 : 0,
                                }}
                                transition={{
                                    duration: .3
                                }}
                                className={`overflow-hidden absolute w-[300px] bg-white rounded-xl ${visibleMenu[field.id] ? 'block z-40' : 'z-30'}`}
                                style={{
                                    left: fields[currentFloor].places[fieldIndex].x,
                                    top: fields[currentFloor].places[fieldIndex].y,
                                }}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: visibleMenu[field.id] ? '100%' : 0 }}
                                    transition={{
                                        duration: .3
                                    }}
                                    className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                >
                                    <button className="cursor-pointer" type="button" onClick={() => handleDeleteSeat(field.id)}>delete</button>
                                    <button className="cursor-pointer" type="button" onClick={() => handleCloseMenu(field.id)}>close</button>
                                </motion.div>

                                <motion.div
                                    className={`flex flex-col items-center`}
                                >
                                    <input
                                        type="text"
                                        className="text-black text-center"
                                        {...register(`floors.${currentFloor}.places.${fieldIndex}.name`)}
                                        placeholder={`New seat ${fieldIndex + 1}`}

                                    />

                                    <textarea
                                        {...register(`floors.${currentFloor}.places.${fieldIndex}.description`)}
                                        className="text-black"
                                        placeholder={`Description`}
                                    >

                                    </textarea>

                                    <input
                                        {...register(`floors.${currentFloor}.places.${fieldIndex}.number_of_seats`)}
                                        type="number"
                                        className="text-black"
                                    />

                                    <input type="file" className="text-black" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSeatImage(fieldIndex, file)
                                        }
                                    }} />

                                    {field.image && (
                                        <div className="relative w-full h-28">
                                            <Image
                                                src={URL.createObjectURL(field.image)}
                                                layout="fill"
                                                objectFit="cover"
                                                alt="design"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>

                        </motion.div>
                    ))}

                </motion.div>

                <button type="submit" className="bg-white text-black p-2 rounded-2xl cursor-pointer">SUBMIT</button>
            </form>
        </div >
    );
}
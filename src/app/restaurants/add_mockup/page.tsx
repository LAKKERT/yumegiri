'use client';

import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState, useRef, useCallback, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { saveRestaurantFiles } from "@/helpers/saveImage";
import { useRouter } from "next/navigation";
import { motion, animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { DeletedScene, Places, Seats, Table } from "@/lib/interfaces/mockup";
import { supabase } from "@/db/supabaseConfig";
import { FloorCounter } from "@/app/components/restaurant/floorCounter";
import { AddRestaurantMockUp } from "@/app/components/restaurant/addRestaurant/addRestaurantMockUp";
import { MainInfo } from "@/app/components/restaurant/addRestaurant/mainInfo";

export default function AddMockUP() {
    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const [order, setOrder] = useState<number>(0);
    const [mockUPUrl, setMockUPUrl] = useState<string | null>(null);
    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);

    const [deletedScene, setDeletedScene] = useState<DeletedScene | null>(null);

    const [tables, setTables] = useState<Table[]>([]);

    const [seatIsSelected, setSeatIsSelected] = useState<boolean>(false);
    const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);

    const carouselRef = useRef<HTMLDivElement>(null);
    const [gallery, setGallery] = useState<File[]>([]);

    const { scrollXProgress } = useScroll({ container: carouselRef });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    const [countOfFloors, setCountOfFloors] = useState<number>(1);

    const seatsRefs = useRef<HTMLDivElement[]>([]);
    const constraintsRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

    const y = useMotionValue(0);
    const x = useMotionValue(0);

    const [isSwitchingFloor, setIsSwitchingFloor] = useState<boolean>(false);

    const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<Places>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            cover: null,
            floors: [{
                uuid: uuidv4(),
                hasMockupUpdate: true,
                mockup: null,
                mockup_height: 0,
                mockup_width: 0,
                tables: []
            }],
        },
    });

    const { fields: floors, append, remove, update } = useFieldArray({
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
            const formData = new FormData();

            data.floors.forEach((floor) => {
                if (floor.mockup) {
                    // если у тебя mockup = File
                    formData.append("files", floor.mockup);

                    // если mockup = File[], например input type="file" multiple
                    // floor.mockup.forEach((f) => formData.append("files", f));
                }
            });

            const res = await fetch("/api/restaurant/uploadModel", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            const filePaths = result.paths;

            if (res.ok && tables) {
                try {
                    const { data: restaurant_id, error: restaurantError } = await supabase
                        .from('restaurant')
                        .insert({
                            name: data.restaurant_name,
                            description: data.description,
                            address: data.address,
                            phone_number: data.phone_number,
                            // cover: coverProperties
                        })
                        .select('id')
                        .single();

                    if (restaurantError) console.error(restaurantError);
                    else {
                        for (let i = 0; i < data.floors.length; i++) {
                            const { data: floorData, error: floorsError } = await supabase
                                .from('floors')
                                .insert({
                                    mockup: filePaths[i],
                                    order: data.floors[i].order,
                                    restaurant_id: restaurant_id.id
                                })
                                .select('uuid')
                                .single();

                            if (floorsError) console.error(floorsError);

                            if (floorData) {
                                for (const table of tables) {
                                    if (table.floor_order === i) {
                                        const { error: tablesError } = await supabase
                                            .from('tables')
                                            .insert({
                                                id: table.id,
                                                status: table.status,
                                                number_of_seats: table.number_of_seats,
                                                floor_id: floorData?.uuid
                                            });

                                        if (tablesError) console.error(tablesError);
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        } catch (error) {
            console.error(error);
        }

        // try {
        //     const galleryArray = (data.gallery) instanceof FileList ? Array.from(data.gallery) : [];

        //     const galleryProperties = galleryArray.map(file => getFileProperties(file));
        //     const galleryDataPromises = galleryArray.map(file => processData(file));
        //     const galleryData = await Promise.all(galleryDataPromises);

        //     const mockupPropeties = data.floors.map(floor => getFileProperties(floor.mockup));
        //     const imagesProperty = data.floors.map(floor => floor.places.map(seat => getFileProperties(seat.image)));
        //     const imagesPropertyForSave = data.floors.flatMap(floor => floor.places.map(seat => getFileProperties(seat.image)));
        //     const coverProperties = getFileProperties(data.cover);

        //     const coverData = await processData(data.cover);

        //     const mockUpDataPromises = data.floors.map(floor => processData(floor.mockup));
        //     const mockUpData = await Promise.all(mockUpDataPromises);

        //     const imagesDataPromises = data.floors.flatMap(floor => floor.places.map(seat => processData(seat.image)));
        //     const imagesData = await Promise.all(imagesDataPromises);

        //     saveRestaurantFiles(mockUpData, mockupPropeties);
        //     saveRestaurantFiles(imagesData, imagesPropertyForSave);
        //     saveRestaurantFiles(coverData, coverProperties);
        //     saveRestaurantFiles(galleryData, galleryProperties);

        //     const payload = {
        //         ...data,
        //     };

        //     if (process.env.NEXT_PUBLIC_ENV === 'production') {
        //         const { data: restaurant_id, error } = await supabase
        //             .from('restaurant')
        //             .insert({
        //                 name: data.restaurant_name,
        //                 description: data.description,
        //                 address: data.address,
        //                 phone_number: data.phone_number,
        //                 cover: coverProperties
        //             })
        //             .select('id')
        //             .single();

        //         if (error) {
        //             console.error(error);
        //         } else {
        //             for (let i = 0; i < galleryProperties.length; i++) {
        //                 const { error: galleryError } = await supabase
        //                     .from('gallery')
        //                     .insert({
        //                         image: galleryProperties[i],
        //                         restaurant_id: restaurant_id.id
        //                     })
        //                 if (galleryError) console.error(galleryError);
        //             }


        //             for (let floorIdx = 0; floorIdx < data.floors.length; floorIdx++) {
        //                 const { data: floor_id, error: floorError } = await supabase
        //                     .from('floors')
        //                     .insert({
        //                         mockup: mockupPropeties[floorIdx],
        //                         mockup_height: data.floors[floorIdx].mockup_height,
        //                         mockup_width: data.floors[floorIdx].mockup_width,
        //                         level: floorIdx,
        //                         restaurant_id: restaurant_id.id,
        //                     })
        //                     .select('uuid')
        //                     .single();
        //                 if (floorError) console.error(floorError);
        //                 else {
        //                     for (let seatIdx = 0; seatIdx < data.floors[floorIdx].places.length; seatIdx++) {
        //                         const { error: placesError } = await supabase
        //                             .from('places')
        //                             .insert({
        //                                 name: data.floors[floorIdx].places[seatIdx].name,
        //                                 description: data.floors[floorIdx].places[seatIdx].description,
        //                                 number_of_seats: data.floors[floorIdx].places[seatIdx].number_of_seats,
        //                                 x: data.floors[floorIdx].places[seatIdx].x,
        //                                 y: data.floors[floorIdx].places[seatIdx].y,
        //                                 xPer: data.floors[floorIdx].places[seatIdx].xPer,
        //                                 yPer: data.floors[floorIdx].places[seatIdx].yPer,
        //                                 image: imagesProperty[floorIdx][seatIdx],
        //                                 floor_id: floor_id.uuid,
        //                             });

        //                         if (placesError) {
        //                             console.error(placesError);
        //                         };
        //                     };
        //                 };
        //             };
        //         };
        //     } else {
        //         const response = await fetch(`/api/restaurant/addRestaurantMockUp`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify(payload)
        //         });

        //         if (response.ok) {
        //             router.push('/');
        //         } else {
        //             console.error('Error occured');
        //         }
        //     }

        // } catch (error) {
        //     console.error(error);
        // }
    };

    const addFloor = () => {
        append({
            uuid: uuidv4(),
            mockup: null,
            order: floors.length += 1,
            hasMockupUpdate: true,
            mockup_height: 0,
            mockup_width: 0,
            tables: []
        });

        setCountOfFloors(prev => prev += 1);
    };

    const handleDeleteFloor = () => {
        if (currentFloor === 0) {
            // Первый этаж нельзя удалить.
        } else {
            remove(currentFloor);
            setDeletedScene({
                index: currentFloor,
                isDeleted: true,
            });
            setIsSwitchingFloor(true);
            setCurrentFloor(prev => prev - 1);
            setCountOfFloors(prev => prev - 1);
        }
    }

    useEffect(() => {
        if (order + 1 === gallery.length) {
            setIsLastImage(true);
        } else {
            setIsLastImage(false);
        }
    }, [order, gallery])

    useEffect(() => {
        if (!carouselRef.current) return

        const previousCards = Array.from({ length: order });
        const widths = previousCards.map((_, index) => index === order ? 275 : 250);

        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        carouselRef.current.scrollLeft = totalWidth + order * 8;
    }, [order])

    const prevImageHandler = () => {
        if (order + 1 > 1) setOrder(prev => prev -= 1);
        else return;
    }

    const nextImageHandler = () => {
        if (order + 1 < gallery.length) setOrder(prev => prev += 1);
    }

    // useEffect(() => {
    //     const changeFloor = async () => {
    //         if (floors[currentFloor] && floors[currentFloor].mockup !== null) {
    //             try {
    //                 const imageData = await new Promise<string>((resolve, reject) => {
    //                     const reader = new FileReader();
    //                     reader.onload = () => resolve(reader.result as string);
    //                     reader.onerror = (error) => reject(error);
    //                     reader.readAsDataURL(floors[currentFloor].mockup as File);
    //                 });

    //                 setMockUPUrl(imageData);
    //             } catch (error) {
    //                 console.error('Ошибка загрузки изображения:', error);
    //             }
    //         } else {
    //             setMockUPUrl(null);
    //         }
    //     };

    //     changeFloor();
    // }, [currentFloor, floors]);

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
                    ...floors[index],
                    mockup: files[0],
                    mockup_height: dimensions.height,
                    mockup_width: dimensions.width,
                });

            } catch (error) {
                console.error('Ошибка загрузки:', error);
            }
        }
    };

    const onSelectedModal = (file: File) => {
        update(currentFloor, { ...floors[currentFloor], mockup: file, hasMockupUpdate: true })

        setValue(`floors.${currentFloor}.mockup`, file);
    }

    const prevFloorHandler = () => {
        if (isSwitchingFloor) return;
        if (currentFloor + 1 > 1) setCurrentFloor(prev => prev -= 1);
        setIsSwitchingFloor(true);
    }

    const nextFloorHandler = () => {
        if (isSwitchingFloor) return;
        if (currentFloor + 1 < countOfFloors) setCurrentFloor(prev => prev += 1);
        setIsSwitchingFloor(true);
    }

    const changeSwithichFloorHandler = (mode: boolean) => {
        setIsSwitchingFloor(mode);
    };

    const ChangeSeatState = (mode: boolean, index: number) => {
        setSeatIsSelected(mode);
        setSelectedTableIndex(index);
    };

    const initTables = (table: Table) => {
        setTables((prev) => [...prev, table])
    }

    const ChangeDeletedScene = () => {
        setDeletedScene({
            index: null,
            isDeleted: false,
        })

    }

    return (
        <div className="flex justify-center min-h-[calc(100vh-100px)] h-full bg-gradient-to-b from-[#D47C7C] via-[#e4c3a2] to-[#E4C3A2] mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />

            <motion.div
                initial={{
                    backgroundColor: 'transparent'
                }}
                animate={{
                    backgroundColor: seatIsSelected ? '#0000006c' : 'transparent',
                }}
                className={`fixed w-full min-h-[calc(100vh-100px)] duration-300 ${seatIsSelected ? ' z-50' : ''}`}
            >
                {seatIsSelected && selectedTableIndex !== null && (
                    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col items-center p-4 text-black rounded-2xl text-lg w-[350px] max-h-[420px] bg-[#FFA685] z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
                        <div className={`w-full text-center flex flex-col gap-4`}>
                            <button type="button" className="self-start cursor-pointer" onClick={() => setSeatIsSelected(false)}>вернуться</button>
                            <p>Заполните форму</p>
                            <input
                                type="number"
                                {...register(
                                    `floors.${currentFloor}.places.${selectedTableIndex}.number_of_seats`
                                )}
                                className={styles.user_data_fields}
                            />
                            <button type="submit" className="cursor-pointer">СОХРАНИТЬ</button>
                        </div>
                    </form>
                )}
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={`relative max-w-[1110px] h-full w-full flex flex-col gap-4 items-center`}>
                    <input
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                const array = Array.from(files);
                                setGallery(array);
                            }
                        }}
                        className="text-white hidden"
                        type="file"
                        accept="image/*"
                        multiple
                        id={`gallery`}
                    />

                    <label htmlFor={`gallery`}>ВЫБРАТЬ ФОТОГРАФИИ</label>

                    <div className="w-full flex flex-row justify-between gap-4">
                        <MainInfo prevImageHandler={prevImageHandler} nextImageHandler={nextImageHandler} carouselRef={carouselRef} maskImage={maskImage} isLastImage={isLastImage} order={order} register={register} gallery={gallery} />
                    </div>

                    <FloorCounter prevFloorHandler={prevFloorHandler} nextFloorHandler={nextFloorHandler} currentFloor={currentFloor} maxFloors={floors.length} y={y} />

                    <div className="flex flex-row items-center gap-5">
                        {floors.map((floor, floorIdx) => (
                            <div key={floorIdx} className={`${floorIdx !== currentFloor ? "hidden" : "block"}`}>
                                <input onChange={(e) => {
                                    const file = e.target.files?.item(0);
                                    if (file instanceof File) {
                                        onSelectedModal(file)
                                    }
                                }} type="file" id="3Dfile" className="hidden" />

                                <label htmlFor="3Dfile" className={`h-full ${styles.restaurant_button}`}>Выбрать 3д файл</label>
                            </div>
                        ))}

                        <button type="button" onClick={addFloor} className={`${styles.restaurant_button}`}>Добавить этаж</button>
                        <button type="button" onClick={handleDeleteFloor} className={`${styles.delete_button} bg-red-400`}>Удалить этаж</button>
                    </div>

                    <AddRestaurantMockUp constraintsRef={constraintsRef} register={register} append={append} remove={remove} update={update} isSwitchingFloor={isSwitchingFloor} changeSwithichFloorHandler={changeSwithichFloorHandler} currentFloor={currentFloor} floors={floors} seatIsSelected={seatIsSelected} ChangeSeatState={ChangeSeatState} initTables={initTables} deletedScene={deletedScene} ChangeDeletedScene={ChangeDeletedScene} />

                    <button type="submit" className={`cursor-pointer`}>
                        СОХРАНИТЬ
                    </button>
                </div>
            </form>
        </div >
    );
}
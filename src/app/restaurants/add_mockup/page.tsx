'use client';

import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { saveRestaurantFiles } from "@/helpers/saveImage";
import { animate, MotionValue, useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { DeletedScene, Places, Table } from "@/lib/interfaces/mockup";
import { supabase } from "@/db/supabaseConfig";
import { FloorCounter } from "@/app/components/restaurant/floorCounter";
import { AddRestaurantMockUp } from "@/app/components/restaurant/addRestaurant/addRestaurantMockUp";
import { MainInfo } from "@/app/components/restaurant/addRestaurant/mainInfo";

export default function AddMockUP() {
    const [order, setOrder] = useState<number>(0);
    const [currentFloor, setCurrentFloor] = useState<number>(0);
    const [isLastImage, setIsLastImage] = useState<boolean>(false);

    const [deletedScene, setDeletedScene] = useState<DeletedScene | null>(null);

    const [tables, setTables] = useState<Table[]>([]);

    const carouselRef = useRef<HTMLDivElement>(null);
    const [gallery, setGallery] = useState<File[]>([]);

    const { scrollXProgress } = useScroll({ container: carouselRef });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    const [countOfFloors, setCountOfFloors] = useState<number>(1);

    const constraintsRef = useRef<HTMLDivElement | null>(null);

    const y = useMotionValue(0);

    const [isSwitchingFloor, setIsSwitchingFloor] = useState<boolean>(false);

    const { control, register, handleSubmit, setValue } = useForm<Places>({
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
                places: []
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

            const galleryArray = Array.from(gallery);

            const galleryProperties = galleryArray.map(file => getFileProperties(file));
            const galleryDataPromises = galleryArray.map(file => processData(file));
            const galleryData = await Promise.all(galleryDataPromises);

            saveRestaurantFiles(galleryData, galleryProperties);

            data.floors.forEach((floor) => {
                if (floor.mockup) {
                    formData.append("files", floor.mockup);
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
                        .from('restaurants')
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
                        for (const image of galleryProperties) {
                            const { error: galleryError } = await supabase
                                .from('gallery')
                                .insert({
                                    restaurant_id: restaurant_id.id,
                                    image: image
                                });
                            if (galleryError) console.error(galleryError);
                        }

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
                                            .from('places')
                                            .insert({
                                                id: table.id,
                                                status: table.status,
                                                number_of_seats: table.number_of_seats,
                                                order: table.order,
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
    };

    const addFloor = () => {
        append({
            uuid: uuidv4(),
            mockup: null,
            order: floors.length += 1,
            hasMockupUpdate: true,
            mockup_height: 0,
            mockup_width: 0,
            places: []
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

    useEffect(() => {
        if (!carouselRef.current) return

        const previousCards = Array.from({ length: order });
        const widths = previousCards.map((_, index) => index === order ? 275 : 250);

        const totalWidth = widths.reduce((sum, width) => sum + width, 0);
        carouselRef.current.scrollLeft = totalWidth + order * 8;
    }, [order])

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

                    <AddRestaurantMockUp constraintsRef={constraintsRef} register={register} update={update} isSwitchingFloor={isSwitchingFloor} changeSwithichFloorHandler={changeSwithichFloorHandler} currentFloor={currentFloor} floors={floors} initTables={initTables} deletedScene={deletedScene} ChangeDeletedScene={ChangeDeletedScene} />

                    <button type="submit" className={`cursor-pointer`}>
                        СОХРАНИТЬ
                    </button>
                </div>
            </form>
        </div >
    );
}
'use client';

import { ChangeEvent, useRef, useState, useCallback, useEffect } from "react";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { Places } from "@/lib/interfaces/mockup";
import { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayReplace, UseFieldArrayUpdate, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { motion } from "motion/react";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';

interface MockUPForm {
    restaurantDetail: Places;
    register: UseFormRegister<Places>;
    fields: FieldArrayWithId<Places, "floors", "id">[];
    append: UseFieldArrayAppend<Places, "floors">;
    remove: UseFieldArrayRemove;
    update: UseFieldArrayUpdate<Places, "floors">;
    replace: UseFieldArrayReplace<Places, "floors">;
}

interface RestaurantForm {
    register: UseFormRegister<Places>;
    setValue: UseFormSetValue<Places>;
}

export function RestaurantEditForm({ register, setValue }: RestaurantForm) {

    return (
        <div>
            <input
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
            <label htmlFor={`cover`}>ВЫБРАТЬ ОБЛОЖКУ</label>
            <input {...register('restaurant_name')} className={`${styles.reservation_inputs}`} type="text" placeholder="НАЗВАНИЕ" />
            <textarea {...register('description')} className={`${styles.reservation_inputs}`} placeholder="ОПИСАНИЕ" />
            <input {...register('address')} className={`${styles.reservation_inputs}`} type="text" placeholder="АДРЕСС" />
            <input {...register('phone_number')} className={`${styles.reservation_inputs}`} type="text" placeholder="НОМЕР ТЕЛЕФОНА" />
        </div>
    )
}

export function EditRestaurantMockUp({ restaurantDetail, register, fields, append, update, remove, replace }: MockUPForm) {

    const constraintsRef = useRef<HTMLDivElement | null>(null);
    const seatsRefs = useRef<HTMLDivElement[]>([]);
    const pointsRefs = useRef<HTMLDivElement[]>([]);

    const [mockUPUrl, setMockUPUrl] = useState<string | null>(null);
    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const [countOfFloors, setCountOfFloors] = useState<number>(0);
    const [currentFloor, setCurrentFloor] = useState<number>(0);

    useEffect(() => {
        setCountOfFloors(restaurantDetail?.floors.length);
        replace(restaurantDetail?.floors);

        let newArray: Record<string, boolean> = {};
        restaurantDetail?.floors.flatMap(floor => floor.places.map(seat => {
            newArray = {...newArray, [seat.id]: seat.visible}
            return newArray;
        }))

        setVisibleMenu(newArray);

    }, [restaurantDetail])

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

        setVisibleMenu(prev => ({ ...prev, [seatidv4]: false }));
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

            setVisibleMenu(prev => ({ ...prev, [idv4]: false }))
        } else {
            console.warn('Invalid currentFloor or fields is empty');
        }
    };

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

    const onClickHandler = (index: string, placeIndex: number) => {
        setVisibleMenu((prev) => {
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
                return prev
            }
        })
    }

    const handleCloseMenu = (itemUUID: string) => {
        setVisibleMenu(prev => ({ ...prev, [itemUUID]: false }));
    };

    const handleDeleteSeat = (seatID: string) => {
        let updatedPlaces = [...fields[currentFloor].places ]
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
                return prev
            })
        }
    }, [constraintsRef, fields]);

    useEffect(() => {
        const changeFloor = async () => {
            if (fields && fields[currentFloor] && fields[currentFloor].mockup && typeof fields[currentFloor].mockup === 'object' ) {
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
            } 
            else if (fields && fields[currentFloor] && typeof fields[currentFloor].mockup === 'string') {
                setMockUPUrl(fields[currentFloor].mockup);
            }
        };

        changeFloor();
    }, [currentFloor, fields]);

    return (
        <div className="w-full max-w-[1110px] flex flex-col items-center gap-4">
            <div>

                <input type="number" defaultValue={1} min={1} max={countOfFloors} className="text-black" onChange={(e) => {
                    setCurrentFloor(Number(e.target.value) - 1);
                }} />

                <div className="flex flex-row gap-5">
                    <button type="button" onClick={addFloor}>Добавить этаж</button>
                </div>

                <input
                    onChange={(e) => selectedMockUP(e, currentFloor)}
                    className="text-white hidden"
                    type="file"
                    accept="image/*"
                    id={`mockUP-${currentFloor}`}
                />
                <label htmlFor={`mockUP-${currentFloor}`}>{mockUPUrl ? 'ИЗМЕНИТЬ ФАЙЛ' : 'ВЫБРАТЬ ФАЙЛ'}</label>
            </div>

            <button type="button" onClick={handleDeleteFloor}>Удалить этаж</button>

            <button type="button" onClick={() => addSeat(currentFloor)} className={`bg-white text-black p-2 rounded-2xl cursor-pointer `}>ДОБАВИТЬ МЕСТО</button>

            <motion.div
                ref={constraintsRef}
                className={`relative mx-auto max-w-[1110px] bg-gray-100`}
                // style={{ width: '100%', height: fields[currentFloor]?.mockup_height }}
                style={{ width: 1110, height: fields[currentFloor]?.mockup_height }}
            >
                {mockUPUrl ? (
                    <div>
                        <Image
                            src={mockUPUrl || ''}
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
                            {/* <motion.div
                                className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[30px] h-[30px] rounded-full bg-transparent outline-3 outline-orange-500 z-30"
                            >

                            </motion.div> */}
                        </motion.div>

                        <motion.div
                            ref={(el: HTMLDivElement) => {
                                if (el) {
                                    seatsRefs.current[fieldIndex] = el;
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
                                    // defaultValue={fields[currentFloor].places[]}
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
                                            src={ typeof field.image === 'string' ? field.image : URL.createObjectURL(field.image)}
                                            // src={field.image}
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
        </div>
    )
}
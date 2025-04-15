'use client';
import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


interface placesInterface {
    uuid: string;
    name: string;
    description: string;
    numberOfSeats: number;
}

interface FormValues {
    seats: placesInterface[];
}

interface coordinatesInterface {
    uuid: string;
    x: number;
    y: number;
}

export default function AddMockUP() {

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const [menuPosition, setMenuPosition] = useState<{ [key: string]: number }>({});
    const [coordinates, setCoordinates] = useState<coordinatesInterface[]>([]);

    const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({

    })

    const { fields, append, remove } = useFieldArray<FormValues>({
        control,
        name: 'seats',
    })

    const constraintsRef = useRef<HTMLDivElement>(null);

    const AddSeat = () => {
        const idv4 = uuidv4();
        append({
            uuid: idv4,
            name: '',
            description: '',
            numberOfSeats: 1,
        });

        setCoordinates(prev => {
            return [...prev, {
                uuid: idv4,
                x: 0,
                y: 0
            }]
        })
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                coordinates: [...coordinates]
            }
            
            const transformedPayload = {
                seats: payload.seats.map((seat) => {
                    const coordinates = payload.coordinates.find(coord => coord.uuid === seat.uuid)
                    
                    if (coordinates) {
                        return {
                            ...seat,
                            x: coordinates.x,
                            y: coordinates.y
                        }
                    }
                    return seat
                })
            }

            const response = await fetch(`/api/menu/addRestoranMockUp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transformedPayload)
            });
        }catch (error) {
            console.error(error);
        }
    }

    const handleDeleteSeat = (seatID: string) => {

        remove(fields.findIndex(field => field.uuid === seatID));

        setCoordinates(prev => {
            return prev.filter((item) => item.uuid !== seatID)
        })

        setVisibleMenu((prev) => {
            const newArray = { ...prev }
            delete newArray[seatID];
            return newArray
        })

        setMenuPosition(prev => {
            const { [seatID]: _, ...rest } = prev;
            return rest;
        });
    };

    const mockUpHandleClick = () => {
        setVisibleMenu((prev) => {
            const newArray = [...prev];
            newArray.map((item, index) => {
                newArray[index] = {
                    uuid: newArray[index].uuid,
                    status: false
                }
            });
            return newArray;
        })
    }

    const handleCloseMenu = (itemUUID: string) => {
        setVisibleMenu(prev => ({
            ...prev,
            [itemUUID]: false
        }));
    }

    return (
        <div>
            <div className=" mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
                <Header />
                <button onClick={AddSeat}>Add seat</button>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className=" h-full w-full flex flex-col items-center bg-[#e4c3a2] px-2">
                        <div ref={constraintsRef}
                            className="relative h-[1000px] w-[1000px] my-50 border-2 border-red-300"
                        >
                            <Image
                                src={'/restaurant mockup/mockup.png'}
                                fill
                                alt="mockup"
                                className="user-none"
                            />

                            {/* {fields ? (
                                <AnimatePresence 
                                    // mode='wait'
                                > */}
                            {fields.map((field, fieldIndex) => {
                                return (
                                    <motion.div key={field.uuid}>
                                        <motion.div
                                            key={field.uuid}
                                            className={`absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30 ${visibleMenu[field.uuid] ? 'z-50' : 'z-30'}`}
                                            drag
                                            whileDrag={{ scale: 0.8, cursor: 'grabbing' }}
                                            dragConstraints={constraintsRef}
                                            dragTransition={{ power: 0, timeConstant: 0 }}
                                            dragMomentum={false}

                                            style={{
                                                x: coordinates[fieldIndex].x,
                                                y: coordinates[fieldIndex].y,
                                            }}

                                            onDragEnd={(event, info) => {
                                                if (!constraintsRef.current) return;
                                                const container = constraintsRef.current?.getBoundingClientRect();

                                                const scrollY = window.scrollY;
                                                const scrollX = window.scrollX;

                                                let relativeX = (info.point.x - container.left) - scrollX;
                                                let relativeY = (info.point.y - container.top) - scrollY;

                                                const minX = (container.left + scrollX);
                                                const maxX = (container.right + scrollX);
                                                const minY = (container.top + scrollY);
                                                const maxY = (container.bottom + scrollY);


                                                let absoluteX = info.point.x;
                                                let absoluteY = info.point.y;

                                                if (info.point.x < minX || info.point.x > maxX) {
                                                    absoluteX = Math.max(minX, Math.min(maxX, absoluteX))
                                                    relativeX = (absoluteX - container.left) - scrollX
                                                }


                                                if (info.point.y < minY || info.point.y > maxY) {
                                                    absoluteY = Math.max(minY, Math.min(maxY, absoluteY))
                                                    relativeY = (absoluteY - container.top) - scrollY
                                                }

                                                setCoordinates(prev => {
                                                    const newArray = [...prev]
                                                    newArray[fieldIndex] = {
                                                        ...prev[fieldIndex],
                                                        x: Math.round(relativeX),
                                                        y: Math.round(relativeY)
                                                    }
                                                    return newArray;
                                                })

                                                setMenuPosition((prev) => ({
                                                    ...prev,
                                                    [field.uuid]: relativeX,
                                                }))
                                            }}


                                            onDragStart={(event, info) => {
                                                setVisibleMenu(prev => ({
                                                    ...prev,
                                                    [field.uuid]: false
                                                }));
                                            }}

                                            onClick={() => {
                                                setVisibleMenu(prev => ({
                                                    ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                                                    [field.uuid]: true
                                                }));
                                            }}
                                        >
                                            <motion.div
                                                className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-[30px] h-[30px] rounded-full bg-transparent outline-3 outline-orange-500 z-30"
                                            >

                                            </motion.div>

                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: visibleMenu[field.uuid] ? 100 : 0
                                            }}
                                            transition={{
                                                duration: .3
                                            }}
                                            className={`overflow-hidden absolute w-[300px] h-[400px] bg-white rounded-xl ${visibleMenu[field.uuid] ? 'block z-40' : 'hidden z-30'}`}
                                            style={{
                                                x: coordinates[fieldIndex].x,
                                                y: coordinates[fieldIndex].y,
                                            }}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: visibleMenu[field.uuid] ? '100%' : 0 }}
                                                transition={{
                                                    duration: .3
                                                }}
                                                className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                            >
                                                <button className="cursor-pointer" onClick={() => handleDeleteSeat(field.uuid)}>delete</button>
                                                <button className="cursor-pointer" onClick={() => handleCloseMenu(field.uuid)}>close</button>
                                            </motion.div>

                                            <motion.div
                                                className={`flex flex-col items-center`}
                                            >
                                                <input
                                                    type="text"
                                                    className="text-black text-center"
                                                    {...register(`seats.${fieldIndex}.name`)}
                                                    placeholder={`New seat ${fieldIndex + 1}`}
                                                    
                                                />

                                                <textarea
                                                    {...register(`seats.${fieldIndex}.description`)}
                                                    className="text-black"
                                                    placeholder={`Description`}
                                                >

                                                </textarea>

                                                <input
                                                    {...register(`seats.${fieldIndex}.numberOfSeats`)}
                                                    type="number"
                                                    className="text-black"
                                                />
                                            </motion.div>
                                        </motion.div>

                                    </motion.div>
                                )
                            })}
                            {/* </AnimatePresence>
                            ) : (
                                null
                            )} */}
                        </div>
                    </div>

                    <button type="submit" className="cursor-pointer">SUBMIT</button>
                </form>
            </div>
        </div>
    )
}
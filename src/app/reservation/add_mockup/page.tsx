'use client';
import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


interface placesInterface {
    uuid: string,
    name: string;
    description: string;
    numberOfSeats: number;
    x: number;
    y: number;
}

interface FormValues {
    seats: placesInterface[];
}

interface visibleMenuInterface {
    uuid: string;
    status: boolean;
}

export default function AddMockUP() {
    const [visibleMenu, setVisibleMenu] = useState<visibleMenuInterface[]>([]);
    const [menuPosition, setMenuPosition] = useState<{ [key: string]: number }>({});
    console.log(menuPosition)


    const { control, register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>()

    const { fields, append, update, replace, remove } = useFieldArray<FormValues>({
        control,
        name: 'seats',
    })


    const constraintsRef = useRef<HTMLDivElement>(null);
    const dragElementRef = useRef<HTMLDivElement>(null);

    const AddSeat = () => {
        const idv4 = uuidv4();
        console.log('idv4', idv4)
        append({
            uuid: idv4,
            name: 'New Seat',
            description: 'Description',
            numberOfSeats: 1,
            x: 0,
            y: 0,
        })
        setVisibleMenu((prev) => {
            const newSeat = {
                uuid: idv4,
                status: false
            };

            const newArray = [...prev, newSeat]

            return newArray;
        })
    }

    const onSubmit = async (data) => {
        console.log(data);
    }

    const handleDeleteSeat = (seatID: string) => {
        const index = fields.findIndex(item => item.uuid === seatID);
        if (index !== -1) {
            remove(index);
        }

        const newFields = fields.filter(field => field.uuid !== seatID);

        setValue('seats', newFields);

        setVisibleMenu((prev) => {
            return prev.filter((item) => item.uuid !== seatID)
        });
        setMenuPosition(prev => {
            const { [seatID]: _, ...rest } = prev;
            return rest;
        });
    };

    // const menuHandleOnClick = () => {
    //     setVisibleMenu((prev) => {
    //         return (!prev)
    //     })
    // }
    console.log('visibleMenu', visibleMenu)

    console.log('fields', fields)

    console.log('menuPosition', menuPosition)

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

                            {fields ? (
                                <div>

                                    {fields.map((field, fieldIndex) => {
                                        return (
                                                <div key={field.id}>
                                                    <motion.div
                                                        className="absolute w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30 "
                                                        ref={dragElementRef}
                                                        drag
                                                        whileDrag={{ scale: 0.8, cursor: 'grabbing' }}
                                                        dragConstraints={constraintsRef}
                                                        dragTransition={{ power: 0, timeConstant: 0 }}
                                                        style={{
                                                            top: `${field.y}%`,
                                                            left: `${field.x}%`,
                                                        }}

                                                        onDragEnd={(event, info) => {
                                                            if (!constraintsRef.current || !dragElementRef.current) return;
                                                            const container = constraintsRef.current?.getBoundingClientRect();
                                                            const element = dragElementRef.current?.getBoundingClientRect();
                                                            console.log('info', container);
                                                            console.log('info', info.point);

                                                            const scrollY = window.scrollY;
                                                            const scrollX = window.scrollX;
                                                            console.log("SCROOL", scrollY)

                                                            // const relativeX = (info.point.x - (element.width / 2))  - container.left; // relative element center
                                                            // const relativeY = (info.point.y - (element.height / 2)) - container.top; // relative element center

                                                            let absoluteX = info.point.x - scrollX;
                                                            let absoluteY = info.point.y - scrollY;

                                                            const minX = (container.left + scrollX) + element.width / 2;
                                                            const maxX = (container.right + scrollX) - element.width / 2;
                                                            const minY = (container.top + scrollY) + element.height / 2;
                                                            const maxY = (container.bottom + scrollY) - element.height / 2;

                                                            console.log(minX, maxX, minY, maxY)

                                                            if (info.point.x < minX || info.point.x > maxX) {
                                                                absoluteX = Math.max(minX, Math.min(maxX, absoluteX))
                                                            }

                                                            absoluteX = (absoluteX - (element.width / 2) - container.left);

                                                            if (info.point.y < minY || info.point.y > maxY) {
                                                                console.log('expression target')
                                                                absoluteY = Math.max(minY - scrollY, Math.min(maxY - scrollY, absoluteY))
                                                                console.log("TEST ABSOLUTE Y", absoluteY)
                                                            }

                                                            absoluteY = (absoluteY - (element.height / 2) - container.top);

                                                            const relativeXpercent = (absoluteX / container.width) * 100;
                                                            const relativeYpercent = (absoluteY / container.height) * 100;

                                                            console.log('percent', relativeXpercent, relativeYpercent);

                                                            update(fields.findIndex((item) => item.id === field.id),
                                                                {
                                                                    ...field,
                                                                    x: relativeXpercent,
                                                                    y: relativeYpercent
                                                                }
                                                            );

                                                            console.log("index", visibleMenu.findIndex((item) => item.uuid === field.uuid))

                                                            const percentWidthForm = ((element.width / container.width) / 2) * 100

                                                            const relativeXPositionForm = relativeXpercent + percentWidthForm;

                                                            setMenuPosition((prev) => ({
                                                                ...prev,
                                                                [field.uuid]: relativeXPositionForm,
                                                            }))

                                                            setVisibleMenu((prev) => {
                                                                const index = visibleMenu.findIndex((item) => item.uuid === field.uuid);
                                                                const newArray = [...prev];

                                                                newArray.map((item, index) => {
                                                                    newArray[index] = {
                                                                        ...newArray[index],
                                                                        status: false,
                                                                    }
                                                                })

                                                                newArray[index] = {
                                                                    ...newArray[index],
                                                                    status: true,
                                                                }

                                                                console.log("New ARRAY", newArray)

                                                                return newArray;
                                                            })
                                                        }}

                                                        onDragStart={(event, info) => {
                                                            setVisibleMenu((prev) => {
                                                                const index = visibleMenu.findIndex((item) => item.uuid === field.uuid);
                                                                const newArray = [...prev];

                                                                newArray[index] = {
                                                                    ...newArray[index],
                                                                    status: false,
                                                                }
                                                                console.log('OFFFFF', newArray)
                                                                return newArray;
                                                            })
                                                        }}

                                                        onClick={() => {
                                                            setVisibleMenu((prev) => {
                                                                console.log('onClick event')
                                                                const index = visibleMenu.findIndex((item) => item.uuid === field.uuid);
                                                                const newArray = [...prev];

                                                                newArray.map((item, arrayIndex) => {
                                                                    newArray[arrayIndex] = {
                                                                        ...newArray[arrayIndex],
                                                                        status: false
                                                                    }
                                                                });

                                                                newArray[index] = {
                                                                    ...newArray[index],
                                                                    status: true,
                                                                };

                                                                console.log(visibleMenu)

                                                                return newArray;
                                                            })
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
                                                            opacity: visibleMenu[fieldIndex].status ? 100 : 0
                                                        }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{
                                                            duration: .3
                                                        }}
                                                        className={`overflow-hidden absolute w-[300px] h-[400px] bg-white rounded-xl ${visibleMenu[fieldIndex].status ? 'block' : 'hidden'}`}
                                                        style={{
                                                            left: `${menuPosition[field.uuid]}%`,
                                                            top: `${field.y}%`,
                                                        }}
                                                    >
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: visibleMenu[fieldIndex].status ? '100%' : 0 }}
                                                            transition={{
                                                                duration: .3
                                                            }}
                                                            className={`flex justify-end px-2 h-[25px] bg-orange-500`}
                                                        >
                                                            <button className="cursor-pointer" onClick={() => handleDeleteSeat(field.uuid)}>delete</button>
                                                        </motion.div>
                                                    </motion.div>
                                                </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                null
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
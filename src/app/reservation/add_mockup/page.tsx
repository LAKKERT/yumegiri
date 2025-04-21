'use client';
import { Header } from "@/app/components/header";
import { v4 as uuidv4 } from 'uuid';
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { saveRestaurantFiles } from "@/helpers/saveImage";
import { useRouter } from "next/navigation";
import styles from '@/app/styles/reservatoin/variables.module.scss';

interface SeatsInterface {
    uuid: string;
    name: string;
    description: string;
    numberOfSeats: number;
    image: string;
}

interface PlacesInterface {
    restaurant_name: string;
    address: string;
    phone_number: string;
    mockUP: string;
    mockup_height: number;
    mockup_width: number;
    description: string;
    seats: SeatsInterface[];
}

interface CoordinatesInterface {
    uuid: string;
    x: number;
    y: number;
    xPer: number;
    yPer: number;
}

export default function AddMockUP() {

    const [visibleMenu, setVisibleMenu] = useState<{ [key: string]: boolean }>({});
    const [coordinates, setCoordinates] = useState<CoordinatesInterface[]>([]);
    const [mockUP, setMockUP] = useState<File>();
    const [mockupSize, setMockupSize] = useState<{ width: number, height: number }>();
    const [seatImage, setSeatImage] = useState<File[]>([]);

    const router = useRouter();

    const { control, register, handleSubmit, formState: { errors } } = useForm<PlacesInterface>({
        defaultValues: {
            restaurant_name: '',
            address: '',
            phone_number: '',
            mockUP: '',
            seats: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
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
            image: '',
            numberOfSeats: 1,
        });

        setCoordinates(prev => {
            return [...prev, {
                uuid: idv4,
                x: 500,
                y: 500,
                xPer: 0,
                yPer: 0,
            }]
        })
    };

    const getFileProperties = (file: File | File[]) => {
        if (Array.isArray(file)) {
            const fileProperties: string[] = [];
            file.map((file) => {
                const fullName = file.name;
                const newNameForImage = `/place design/${Date.now()}_${fullName}`
                fileProperties.push(newNameForImage)
            })
            return fileProperties;
        } else {
            const fullName = file.name;
            const newNameForMockUP = `/restaurant mockup/${Date.now()}_${fullName}`;
            return newNameForMockUP;
        }
    }

    const processData = (file: File | File[]): Promise<string | string[]> => {
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
            ) as Promise<string[]>;
        } else {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });
        }
    };

    const onSubmit = async (data: PlacesInterface) => {
        try {

            if (!mockUP || !seatImage) {
                console.log('no files');
                return
            }

            const mockupProperty = getFileProperties(mockUP);
            const imagesProperty = getFileProperties(seatImage);

            const mockUpData = await processData(mockUP);
            const imagesData = await processData(seatImage);

            saveRestaurantFiles(mockUpData, mockupProperty);
            saveRestaurantFiles(imagesData, imagesProperty);

            console.log(imagesProperty, imagesData)

            const payload = {
                ...data,
                coordinates: [...coordinates]
            }

            const transformedPayload = {
                restaurantData: {
                    restaurant_name: data.restaurant_name,
                    description: data.description,
                    address: data.address,
                    phone_number: data.phone_number,
                    mockUP: mockupProperty,
                    mockup_height: mockupSize?.height,
                    mockup_width: 1110,
                },
                seats: data.seats.map((seat, index) => {
                    const coordinates = payload.coordinates.find(coord => coord.uuid === seat.uuid);
                    if (coordinates) {
                        return {
                            ...seat,
                            image: imagesProperty[index],
                            x: coordinates.xPer,
                            y: coordinates.yPer
                        };
                    }
                    return seat;
                })
            };

            const response = await fetch(`/api/restaurant/addRestaurantMockUp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transformedPayload)
            });

            if (response.ok) {
                router.push('/');
            } else {
                console.error('Error occured')
            }
        } catch (error) {
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
    };

    const handleDragElement = (event, info, fieldIndex: number) => {
        if (!constraintsRef.current) return;
        const container = constraintsRef.current?.getBoundingClientRect();

        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let relativeX = (info.point.x - container.left) - scrollX;
        let relativeY = (info.point.y - container.top) - scrollY;

        const relativeXPercent = Math.max(0, Math.min(100, (relativeX / container.width) * 100));
        const relativeYPercent = Math.max(0, Math.min(100, (relativeY / container.height) * 100));

        const minX = (container.left + scrollX);
        const maxX = (container.right + scrollX);
        const minY = (container.top + scrollY);
        const maxY = (container.bottom + scrollY);


        let absoluteX = info.point.x;
        let absoluteY = info.point.y;

        if (info.point.x < minX || info.point.x > maxX) {
            absoluteX = Math.max(minX, Math.min(maxX, absoluteX));
            relativeX = (absoluteX - container.left) - scrollX;
        }

        if (info.point.y < minY || info.point.y > maxY) {
            absoluteY = Math.max(minY, Math.min(maxY, absoluteY));
            relativeY = (absoluteY - container.top) - scrollY;
        }

        console.log('relativePX', relativeX, relativeY)
        console.log('percent', relativeXPercent, relativeYPercent)

        setCoordinates(prev => {
            const newArray = [...prev]
            newArray[fieldIndex] = {
                ...prev[fieldIndex],
                x: Math.round(relativeX),
                y: Math.round(relativeY),
                xPer: Math.round(relativeXPercent),
                yPer: Math.round(relativeYPercent),
            }
            return newArray;
        })
    }

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

    console.log("RERENDER")

    return (
        <div className="flex justify-center min-h-[calc(100vh-100px)] h-full bg-[#e4c3a2] mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[1110px] flex flex-col items-center gap-4">

                <div className="flex flex-col items-center gap-4 w-full max-w-[730px] max-h-[420px] p-4 bg-white text-black rounded-2xl text-lg">
                    <input {...register('restaurant_name')} className={`${styles.reservation_inputs}`} type="text" placeholder="НАЗВАНИЕ" />
                    <textarea {...register('description')} className={`${styles.reservation_inputs}`} placeholder="ОПИСАНИЕ" />
                    <input {...register('address')} className={`${styles.reservation_inputs}`} type="text" placeholder="АДРЕСС" />
                    <input {...register('phone_number')} className={`${styles.reservation_inputs}`} type="text" placeholder="НОМЕР ТЕЛЕФОНА" />
                    <input
                        onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                try {
                                    const imageData = await new Promise<string>((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = () => resolve(reader.result as string);
                                        reader.onerror = (error) => reject(error);
                                        reader.readAsDataURL(files[0]);
                                    });

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

                                    console.log('Размеры:', dimensions.width, 'x', dimensions.height);
                                    setMockupSize({ ...dimensions })
                                    setMockUP(files[0]);

                                } catch (error) {
                                    console.error('Ошибка загрузки:', error);
                                }
                            }
                        }}
                        className="text-white hidden"
                        type="file"
                        accept="image/*"
                        id="mockUP"
                    />
                    <label htmlFor="mockUP">ВЫБРАТЬ ФАЙЛ</label>
                </div>

                <div className="h-full w-full flex flex-col items-center gap-4 px-2">
                    <button type="button" onClick={AddSeat} className={`bg-white text-black p-2 rounded-2xl cursor-pointer ${mockUP ? 'block' : 'hidden'}`}>ДОБАВИТЬ МЕСТО</button>
                    <motion.div
                        ref={constraintsRef}
                        className={`relative mx-auto max-w-[1110px] bg-gray-100`}
                        style={{
                            width: '100%',
                            height: mockupSize?.height
                        }}
                    >
                        {mockUP ? (
                            <div>
                                <Image
                                    src={URL.createObjectURL(mockUP)}
                                    alt="mockup"
                                    fill
                                    priority 
                                    className="h-auto w-full"
                                />
                            </div>
                        ) : (
                            null
                        )}

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

                                        onDragEnd={(event, info) => handleDragElement(event, info, fieldIndex)}

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
                                            left: coordinates[fieldIndex].x,
                                            top: coordinates[fieldIndex].y,
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
                                            <button className="cursor-pointer" type="button" onClick={() => handleDeleteSeat(field.uuid)}>delete</button>
                                            <button className="cursor-pointer" type="button" onClick={() => handleCloseMenu(field.uuid)}>close</button>
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

                                            <input type="file" className="text-black" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSeatImage(prev => [...prev, file]);
                                                }
                                            }} />

                                            {seatImage && (
                                                <div className="relative w-full h-28">
                                                    {Array.isArray(seatImage) && seatImage[fieldIndex] && (
                                                        <Image
                                                            src={URL.createObjectURL(seatImage[fieldIndex])}
                                                            layout="fill"
                                                            objectFit="cover"
                                                            alt="design"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>

                                </motion.div>
                            )
                        })}
                        {/* </AnimatePresence>
                            ) : (
                                null
                            )} */}
                    </motion.div>
                </div>

                <button type="submit" className="bg-white text-black p-2 rounded-2xl cursor-pointer">SUBMIT</button>
            </form>
        </div>
    )
}
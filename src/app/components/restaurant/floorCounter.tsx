"use client"

import { motion, AnimatePresence, MotionValue } from "framer-motion";

interface FloorCounter {
    prevFloorHandler: () => void,
    nextFloorHandler: () => void,
    currentFloor: number,
    seatsIsSelected: boolean,
    isEditMode: boolean,
    maxFloors: number,
    y: MotionValue<number>,
}

export function FloorCounter({ prevFloorHandler, nextFloorHandler, currentFloor, maxFloors, seatsIsSelected, isEditMode, y }: FloorCounter) {
    return (
        <div className={`flex flex-col items-center gap-4 ${isEditMode ? 'hidden' : ''}`}>
            <div className="w-auto h-[70px] flex flex-row items-center justify-center gap-3 bg-white rounded-xl px-4">
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
                <span className="inline-block w-[40px] text-black text-center text-4xl uppercase align-text-top pb-2">{maxFloors}</span>

                <div className="flex flex-row gap-2">
                    <button type="button" onClick={prevFloorHandler} disabled={seatsIsSelected ? true : false} className={`relative w-[45px] h-[45px] flex justify-center items-center transform transition-colors ease-in-out duration-300 bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer`}>
                        <p className="absolute top-0">&lt;</p>
                    </button>

                    <button type="button" onClick={nextFloorHandler} disabled={seatsIsSelected ? true : false} className={`relative w-[45px] h-[45px] flex justify-center items-center bg-[#f8845a] hover:bg-[#BF724F] rounded-lg text-3xl cursor-pointer`}>
                        <p className="absolute top-0">&gt;</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
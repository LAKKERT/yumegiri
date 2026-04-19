"use client";

import { Places } from "@/lib/interfaces/mockup";
import { motion, AnimatePresence, MotionValue } from "framer-motion";
import Image from "next/image";
import { RefObject } from "react";

interface MainInfo {
    prevImageHandler: () => void;
    nextImageHandler: () => void;
    carouselRef: RefObject<HTMLDivElement | null>;
    maskImage: MotionValue<string>;
    isLastImage: boolean;
    currentRestaurant: Places | undefined;
    order: number;
}

export function MainInfo({
    prevImageHandler,
    nextImageHandler,
    carouselRef,
    maskImage,
    isLastImage,
    currentRestaurant,
    order
}: MainInfo) {
    return (
        <div className="flex flex-row items-center gap-4">

            {/* LEFT BUTTON */}
            <motion.button
                type="button"
                className="w-6.25 h-6.25 bg-white rounded-full text-black cursor-pointer"
                onClick={prevImageHandler}

                initial={{ scale: 1 }}
                whileTap={{ scale: .8 }}
                transition={{
                    duration: .3,
                    ease: 'easeInOut'
                }}
            >
                <Image
                    src={"/other/arrow.svg"}
                    alt="previous"
                    quality={100}
                    width={25}
                    height={25}
                />
            </motion.button>

            {/* CAROUSEL */}
            <motion.div
                ref={carouselRef}
                style={{
                    maskImage,
                    paddingRight: isLastImage ? 0 : "400px",
                    width: isLastImage ? "250px" : "650px",
                }}
                className="snap-x scroll-smooth flex flex-row items-center gap-4 overflow-hidden overflow-x-hidden transform transition-all duration-300"
            >
                <AnimatePresence mode="wait">
                    {Array.isArray(currentRestaurant?.gallery)
                        ? currentRestaurant.gallery.map((image, index) => (
                              <motion.div
                                  key={image.id}
                                  id={`image${index}`}
                                  className={`relative snap-start bg-white shrink-0 transform-3d ${
                                      isLastImage ? "scroll-ml-0" : "scroll-ml-4"
                                  } ${
                                      order === index
                                          ? "w-68.75 h-83.75"
                                          : "min-w-62.5 w-62.5 h-77.5"
                                  } rounded-md`}
                                  initial={{
                                      y: 80,
                                      opacity: 0,
                                  }}
                                  exit={{
                                      y: -80,
                                      opacity: 0,
                                      background: "#000",
                                  }}
                                  animate={{
                                      y: 0,
                                      opacity: 1,
                                      background: "#000",
                                  }}
                                  transition={{
                                      duration: 0.3,
                                      ease: "easeInOut",
                                  }}
                              >
                                  <Image
                                      src={image.image}
                                      alt="restaurant gallery"
                                      fill
                                      className="rounded-md origin-center object-cover"
                                  />
                              </motion.div>
                          ))
                        : null}
                </AnimatePresence>
            </motion.div>

            {/* RIGHT BUTTON */}
            <motion.button
                type="button"
                className="w-6.25 h-6.25 bg-white rounded-full text-black cursor-pointer"
                onClick={nextImageHandler}

                initial={{ scale: 1 }}
                whileTap={{ scale: .8 }}
                transition={{
                    duration: .3,
                    ease: 'easeInOut'
                }}
            >
                <Image
                    className="rotate-180"
                    src={"/other/arrow.svg"}
                    alt="previous"
                    quality={100}
                    width={25}
                    height={25}
                />
            </motion.button>
        </div>
    );
}
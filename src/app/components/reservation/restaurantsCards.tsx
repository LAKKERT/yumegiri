"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";

interface Props {
    restaurants: RestaurantInterface[];
    control: Control;
    places: SeatsInterface[];
    restaurantIsSelected: number | null;
    setRestaurantIsSelected: React.Dispatch<React.SetStateAction<number | null>>;
    setMockup: React.Dispatch<React.SetStateAction<MockupInterface | undefined>>;
    setRestaurantDetail: React.Dispatch<React.SetStateAction<SeatsInterface[]>>;
}

export function RestaurantsCards({ restaurants, control, places, restaurantIsSelected, setRestaurantIsSelected, setMockup, setRestaurantDetail }: Props) {

    console.log('restaurants', restaurants)

    return (

        

        // <div>
        //     {restaurants.map((item) => {
        //             console.log('item', item)
        //             return (
        //                 <Controller
        //                     key={item.id}
        //                     name='restaurant_id'
        //                     control={control}
        //                     render={({ field }) => (
        //                         <motion.div>
        //                             <div>
        //                                 <motion.div
        //                                     animate={{
        //                                         display: restaurantIsSelected ? 'none' : 'block',
        //                                         transition: {
        //                                             delay: .5
        //                                         }
        //                                     }}
        //                                     className={`w-[250px] h-[350px] text-black bg-white rounded-2xl cursor-pointer transform transition-all duration-500 origin-top ${restaurantIsSelected ? 'opacity-0 ' : 'opacity-100'}`}
    
        //                                     onClick={() => {
        //                                         field.onChange(item.id);
        //                                         setMockup({
        //                                             mockup: item.mockup,
        //                                             mockup_width: item.mockup_width,
        //                                             mockup_height: item.mockup_height
        //                                         });
        //                                         setRestaurantIsSelected(item.id);
        //                                         setRestaurantDetail(() => {
        //                                             const newArray = places.filter((place) => place.restaurant_id === item.id);
        //                                             console.log('newArray', newArray);
        //                                             return newArray;
        //                                         });
        //                                     }}
        //                                 >
        //                                     <div className={``}>
        //                                         <p>{item.name}</p>
        //                                         <p>{item.description}</p>
        //                                     </div>
        //                                 </motion.div>
    
        //                             </div>
        //                         </motion.div>
        //                     )}
        //                 >
        //                 </Controller>
        //             )
        //         })
        //     }
        // </div>
    )
}
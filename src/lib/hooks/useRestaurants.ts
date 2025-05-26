'use client';

import { supabase } from "@/db/supabaseConfig";
import { useState, useEffect } from "react";
import { Restaurant } from "../interfaces/mockup";

export function useRestaurants() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
        const getRestaurants = async () => {
            try {
                if (process.env.NEXT_PUBLIC_ENV === 'production') {
                    const {data: restaurantData, error: restaurantError} = await supabase
                        .from('restaurant')
                        .select(`
                            id,
                            name,
                            address,
                            phone_number,
                            description,
                            cover,
                            floors (
                                uuid,
                                mockup,
                                mockup_height,
                                mockup_width,
                                level,
                                restaurant_id,
                                places (
                                    id,
                                    visible,
                                    place_name,
                                    description,
                                    status,
                                    number_of_seats,
                                    image,
                                    x,
                                    y,
                                    floor_id
                                )
                            )
                        `);
                    if (restaurantError) console.error(restaurantError);
                    else {
                        setRestaurants(restaurantData);
                    }

                } else {
                    const response = await fetch(`/api/restaurant/getRestaurantAPI`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
    
                    const result = await response.json();
    
                    if (response.ok) {
                        setRestaurants(result.restaurantData);
                    } else {
                        console.error('error occured');
                    }
                }
            } catch (error) {
                console.error(error)
            }
        };

        getRestaurants();
    }, [])

    return { restaurants }
}
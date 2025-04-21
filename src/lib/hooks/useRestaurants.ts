'use client';

import { useState, useEffect } from "react";

export function useRestaurants() {

    const [restaurants, setRestaurants] = useState<RestaurantInterface[]>([]);
    const [places, setPlaces] = useState<SeatsInterface[]>([]);
    const [visibleMenu, setVisibleMenu] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const getRestaurants = async () => {
            try {
                const response = await fetch(`/api/restaurant/getRestaurantAPI`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setRestaurants(result.restaurantData);
                    setPlaces(result.placesData);
                } else {
                    console.error('error occured');
                }

            } catch (error) {
                console.error(error)
            }
        };

        getRestaurants();
    }, [])

    return { restaurants, places }
}
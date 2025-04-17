'use server';

import Connect from "@/db/dbConfig";
import { param } from "motion/react-client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function addRestaurantMockUp(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {

            const seatsData = req.body.seats
            const { restaurant_name, description, address, phone_number, mockUP, mockup_height, mockup_width } = req.body.restaurantData;

            const conn = await Connect();
            try {
                const createRestaurant = await conn.query(`INSERT INTO restaurant (name, description, address, phone_number, mockup, mockup_height, mockup_width) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [
                    restaurant_name,
                    description,
                    address,
                    phone_number,
                    mockUP,
                    mockup_height,
                    mockup_width
                ]);

                const restaurantId = createRestaurant.rows[0].id;

                const values = seatsData.map(item => [
                    restaurantId,
                    item.name,
                    item.description,
                    item.numberOfSeats,
                    item.image,
                    item.x,
                    item.y
                ]).flat();
                
                const params = Array.from({ length: seatsData.length }, (_, i) => 
                    `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
                ).join(', ');
                
                // bulk insert
                const query = `INSERT INTO places (restaurant_id, place_name, description, number_of_seats, image, x, y) VALUES ${params}`;
                conn.query(query, values);
                return res.status(200).json({ message: 'Saved in database' });
            }catch (error) {
                console.error(error)
                res.status(500).json({ message: 'Error save to database' });
            }
        }catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Server side error' });
        }
    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
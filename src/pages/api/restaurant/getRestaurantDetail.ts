'use server';

import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getRestaurantDetail(req:NextApiRequest, res:NextApiResponse) {
    if (req.method === 'GET') {
        try {

            const conn = await Connect();
            const id = req.headers['id']

            if (!id) {
                return res.status(400).json({ message: 'Ресторан ID не указан' });
            }

            try {
                const restaurant = await conn.query(`SELECT * FROM restaurant WHERE id = $1`, [
                    id
                ])
                
                if (restaurant.rows.length === 0) {
                    return res.status(404).json({ message: 'Ресторан не найден' });
                }

                const places = await conn.query(`SELECT * FROM places WHERE restaurant_id = $1`, [
                    id
                ])

                return res.status(200).json({restaurant: restaurant.rows[0], places: places.rows});
            }catch (error) {
                console.error('Server error', error);
                return res.status(500).json({ message: 'Database error occured' })
            }
        }catch (error) {
            return res.status(500).json({ message: `Server side error ${error}` })
        }
    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
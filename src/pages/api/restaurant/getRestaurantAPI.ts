'use server';

import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getAllRestorans(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
        
            const conn = await Connect();

            try {
                const placesResult = await conn.query(`SELECT * FROM places`, []);

                const restaurantResult = await conn.query(`SELECT * FROM restaurant`, []);


                return res.status(200).json({ placesData: placesResult.rows, restaurantData: restaurantResult.rows })

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
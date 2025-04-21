'use server';
import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";
export default async function addReservation(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === "POST") {
        try {

            const { name, booked_date, phone_number, place_Id, restaurant_id } = req.body;

            const conn = await Connect();

            try {
                await conn.query(`INSERT INTO guests (name, booked_date, phone_number, place_Id, restaurant_id) VALUES ($1, $2, $3, $4, $5)`, [
                    name,
                    booked_date,
                    phone_number,
                    place_Id,
                    restaurant_id
                ]);

                return res.status(200).json({ message: 'Столик забронирован успешно' });

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
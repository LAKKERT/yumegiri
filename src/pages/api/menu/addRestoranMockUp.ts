'use server';

import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";

export default async function addRestoranMockUp(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            console.log('payload', req.body)

            const data = req.body.seats

            const conn = await Connect();
            try {
                const values = data.map(item => [
                    item.name,
                    item.description,
                    item.numberOfSeats,
                    item.x,
                    item.y
                ]).flat();
                
                const params = Array.from({ length: data.length }, (_, i) => 
                    `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
                ).join(', ');
                
                // bulk insert
                const query = `INSERT INTO places (place_name, description, number_of_seats, x, y) VALUES ${params}`;
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
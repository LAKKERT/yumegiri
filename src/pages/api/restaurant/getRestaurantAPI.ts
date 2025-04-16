'use server';

import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getAllRestorans(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
        
            const conn = await Connect();

            try {
                const result = await conn.query(`SELECT * FROM places WHERE restaurant_id = $1`, [
                    14
                ])

                return res.status(200).json({ data: result.rows })

            }catch (error) {
                console.error('Server error', error);
                return res.status(500).json({ message: 'Database error occured' })
            }

        }catch (error) {
            return res.status(500).json({ message: 'Server side error' })
        }
    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
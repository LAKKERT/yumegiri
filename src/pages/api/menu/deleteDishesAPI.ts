'use server';
import Connect from "@/db/dbConfig";
import { NextApiRequest, NextApiResponse } from "next";

export default async function DeleteDishes(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
        const ids = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: "Invalid input. IDs must be an array." });
        }

        const conn = await Connect();
        const params = Array.from({ length: ids.length }, (_, i) => `($${i + 1})`).join(', ');
        
        try {
            await conn.query(
                `DELETE FROM menu WHERE id IN (${params})`,
                ids
            );
            return res.status(200).json({ message: `Dishes deleted` });
        } catch (error) {
            return res.status(500).json({ message: `Error deleting dishes: ${error.message}` });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
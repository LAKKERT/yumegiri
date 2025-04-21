'use server';
import { NextApiRequest, NextApiResponse } from "next";
import Connect from "@/db/dbConfig";

export default async function UpdateDish(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PUT") {

        const {                
            name,
            description,
            weight,
            price,
            kcal,
            proteins,
            carbohydrates,
            fats,
            category_id,
            id
        } = req.body;

        const conn = await Connect();

        try {
            await conn.query(`UPDATE menu SET  
                name = $1,
                description = $2,
                weight = $3,
                price = $4,
                kcal = $5,
                proteins = $6,
                carbohydrates = $7,
                fats = $8,
                category_id = $9
                WHERE id = $10`, [
                    name,
                    description,
                    weight,
                    price,
                    kcal,
                    proteins,
                    carbohydrates,
                    fats,
                    category_id,
                    id
                ]);

            res.status(200).json({ message: 'Dish was updated' });
        }catch (error) {
            console.error('Server error', error);
            return res.status(500).json({ message: 'Database error occured' })
        }
    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
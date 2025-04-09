'use server';
import { NextApiRequest, NextApiResponse } from "next";
import Connect from "@/db/dbConfig";

export default async function AddDishAPI(req: NextApiRequest, res:NextApiResponse) {
    if (req.method === 'POST') {
        const { category, fats, carbohydrates, proteins, kcal, price, weight, description, name, fileName } = req.body
        const category_id = parseInt(category);

        const conn = await Connect();

        try {
            await conn.query(`INSERT INTO menu (category_id, fats, carbohydrates, proteins, kcal, price, weight, description, name, image) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
                [
                    category_id, 
                    fats, 
                    carbohydrates, 
                    proteins, 
                    kcal, 
                    price, 
                    weight, 
                    description, 
                    name, 
                    fileName
                ]
            );
            return res.status(201).json({ message: 'data added successfully' });
        }catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: 'dataBase error' });
        }

    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
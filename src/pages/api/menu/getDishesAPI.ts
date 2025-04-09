'use server';
import { NextApiRequest, NextApiResponse } from "next";
import Connect from "@/db/dbConfig";

export default async function GetDishes(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const conn = await Connect();
        
        try {
            const categories = await conn.query(`
                    SELECT * FROM categories
                `)
            const dishes = await conn.query(`
                SELECT 
                    m.*, 
                    c.name AS category_name 
                FROM menu m
                LEFT JOIN categories c 
                    ON m.category_id  = c.id
            `);
            return res.status(200).json({ dishes: dishes.rows, categories: categories.rows })
        }catch (error) {
            console.error('Server error', error);
            return res.status(500).json({ message: 'Database error occured' })
        }
    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
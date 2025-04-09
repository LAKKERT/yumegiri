'use server';
import { NextApiRequest, NextApiResponse } from "next";
import Connect from "@/db/dbConfig";

export default async function AddCategoryAPI(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { name } = req.body;

        const conn = await Connect();
        
        try {
            await conn.query(`INSERT INTO categories (name) VALUES ($1)`,
                [name]
            )
            
            return res.status(201).json({ message: 'category added successfully' })
        }catch (error) {
            console.log(error)
            return res.status(500).json({ message: `dataBase error ${error}` })
        }

    }else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
"use server";
import { NextApiRequest, NextApiResponse } from "next";
import Connect from "@/db/dbConfig";
export default async function GetCategories(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const conn = await Connect();

        try {
            const result = await conn.query(`SELECT * FROM categories`);
            return res.status(200).json({result: result.rows});
        } catch (error) {
            console.log("error getting data", error);
            return res.status(500).json({ message: "error getting data" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}

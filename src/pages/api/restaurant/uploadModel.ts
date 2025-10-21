// pages/api/restaurant/uploadModel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Busboy from "busboy";
import path from "path";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(405).end();

    const busboy = Busboy({ headers: req.headers });

    const uploadsDir = path.join(process.cwd(), "public/THREE");
    console.log("uploadsDir", uploadsDir);

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileWrites: Promise<void>[] = [];
    const fields: Record<string, string> = {};

    const filePaths: string[] = [];

    busboy.on("file", (fieldname, file, info) => {
        const { filename } = info;

        console.log(`📂 Загружаем файл: ${filename}`);

        const saveTo = path.join(uploadsDir, filename);
        const writeStream = fs.createWriteStream(saveTo);

        const filePath = `/THREE/${filename}`;
        filePaths.push(filePath);

        const fileWrite = new Promise<void>((resolve, reject) => {
            file.pipe(writeStream);
            writeStream.on("finish", () => resolve());
            writeStream.on("error", reject);
        });

        fileWrites.push(fileWrite);
    });

    busboy.on("field", (fieldName, value) => {
        fields[fieldName] = value;
    });

    busboy.on("finish", async () => {
        try {
            await Promise.all(fileWrites);
            res
                .status(200)
                .json({ message: "Файл(ы) успешно загружены", paths: filePaths });
        } catch (error) {
            res.status(500).json({ error: `Ошибка при сохранении файлов. ${error}` });
        }
    });

    req.pipe(busboy);
}

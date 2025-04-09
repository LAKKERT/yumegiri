"use server";

import fs from 'fs';
import path from 'path';

export async function saveImage(file: string, fileURL: string, fileName: string) {
    try {
        if (file) {
            const base64Data = file.replace(/^data:.+;base64,/, "");

            const buffer = Buffer.from(base64Data, "base64");

            let filePath = path.join(process.cwd(), "public", fileURL)

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            }

            filePath += fileName;

            console.log("File Path:", filePath);
            console.log("File saved:", filePath);

            fs.writeFileSync(filePath, buffer)

        }
    }catch (error) {
        console.log(error)
    }
}
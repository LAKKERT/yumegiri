"use server";

import fs from 'fs';
import path from 'path';

export async function saveImage(file: string, fileURL: string, fileName: string) {
    try {
        if (file) {
            const base64Data = file.replace(/^data:.+;base64,/, "");

            const buffer = Buffer.from(base64Data, "base64");

            let filePath = path.join(process.cwd(), "public", fileURL);

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath)
            };

            filePath += fileName;

            console.log("File Path:", filePath);
            console.log("File saved:", filePath);

            fs.writeFileSync(filePath, buffer)
        }
    }catch (error) {
        console.error(error)
    }
}

export async function saveRestaurantFiles(files: string | string[] | null | (string | string[] | null)[], fileURL: string | string[] | null | (string | string[] | null)[] | (string | string[] | null)[][]) {
    try {
        if (files === null || fileURL === null) return;

        if (Array.isArray(files)) {
            files.forEach((file, index) => {
                if (typeof file === 'string') {
                    const url = Array.isArray(fileURL) ? fileURL[index] : fileURL as string;
                    if (typeof url === 'string') {
                        const base64Data = file.replace(/^data:.+;base64,/, "");
                        const buffer = Buffer.from(base64Data, "base64");
                        const filePath = path.join(process.cwd(), "public", url);
                        fs.writeFileSync(filePath, buffer);
                    }
                }
            });
        } else if (typeof files === 'string') {
            const url = Array.isArray(fileURL) ? fileURL[0] : fileURL as string;
            if (typeof url === 'string') {
                const base64Data = files.replace(/^data:.+;base64,/, "");
                const buffer = Buffer.from(base64Data, "base64");
                const filePath = path.join(process.cwd(), "public", url);
                fs.writeFileSync(filePath, buffer);
            }
        }
    } catch (error) {
        console.error(error);
    }
}
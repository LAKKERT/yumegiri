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

export async function saveRestaurantFiles(file: string | string[], fileURL: string | string[]) {
    try {
        if (Array.isArray(file)) {
            file.map((file, index) => {
                const base64Data = file.replace(/^data:.+;base64,/,"");

                const buffer = Buffer.from(base64Data, "base64");

                const filePath = path.join(process.cwd(), "public", fileURL[index]);

                fs.writeFileSync(filePath, buffer)
            })
        }else {
            const base64Data = file.replace(/^data:.+;base64,/,"");

            const buffer = Buffer.from(base64Data, 'base64');

            const filePath = path.join(process.cwd(), "public", fileURL as string);

            fs.writeFileSync(filePath, buffer)
        }

    }catch (error) {
        console.error(error)
    }
}
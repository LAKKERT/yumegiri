"use client";

export async function processData(file: File | File[] | string | null): Promise<string | string[] | null> {
    if (Array.isArray(file)) {
        return Promise.all(
            file.map(
                (singleFile) =>
                    new Promise((resolve, reject) => {
                        if (!singleFile) resolve(null);
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(singleFile);
                    })
            )
        ) as Promise<string[] | null>;
    } else {
        if (file && typeof file === "object") {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });
        } else {
            return Promise.resolve(null);
        }
    }
}

'use client';
import { Header } from "@/app/components/header";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { saveImage } from "@/helpers/saveImage";

const validationForm = Yup.object().shape({
    name: Yup.string().min(3, 'Минимальное количество символов 3').max(12, 'максимальное количество символов 12').required("Поле должно быть заполнено"),
    description: Yup.string().min(6, 'Минимальное количество символов 6').required("Поле должно быть заполнено"),
    weight: Yup.number().required("Поле должно быть заполнено"),
    price: Yup.number().required("Поле должно быть заполнено"),
    kcal: Yup.number().required("Поле должно быть заполнено"),
    proteins: Yup.number().required("Поле должно быть заполнено"),
    carbohydrates: Yup.number().required("Поле должно быть заполнено"),
    fats: Yup.number().required("Поле должно быть заполнено"),
    category: Yup.string().required('Выберите категорию')
})

export default function AddDish() {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [categories, setCategories] = useState<CategoriesInterface[] | null>(null);

    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<AddDishInterface>({
        resolver: yupResolver(validationForm),
    })

    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await fetch(`/api/menu/getCategoriesAPI`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const result = await response.json()

                if (response.ok) {
                    setCategories(result.result);
                } else {
                    console.log("DataBase error");
                }

            } catch (error) {
                console.log(error);
            }
        }

        getCategories();
    }, [])

    const onSubmit = async (data: AddDishInterface) => {
        console.log(data)

        if (!selectedFile) {
            console.log('no files');
            return
        }

        const fileProperty = await getFileName(selectedFile, data.category);
        const fileData = await processFile(selectedFile);
        console.log(fileProperty)
        saveImage(fileData, fileProperty.path, fileProperty.newName);

        try {

            const payload = {
                ...data,
                fileName: fileProperty.fullPath
            }

            const response = await fetch('/api/menu/addDishAPI', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                router.push('/menu')
            } else {
                console.log('server error occured');
            }

        } catch {
            console.log('Error')
        }
    }

    const getFileName = async (file: File, category: string) => {
        const categoryInt = parseInt(category)
        const categoryName = categories?.find(c => c.id === categoryInt);
        const fullName = file.name;
        console.log(categoryName?.name);

        const newName = `${Date.now()}_${fullName}`;
        const path = `/menu/${categoryName?.name}/`;
        console.log('path', path);
        const fullPath = `${path}${newName}`;
        return { newName, path, fullPath }
    }

    const processFile = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        })
    }

    console.log(errors)
    console.log(categories)

    return (
        <div className="h-[calc(100vh-100px)] w-full flex justify-center items-center bg-[#e4c3a2] px-2 mt-[100px] font-[family-name:var(--font-pacifico)]  caret-transparent">
            <Header />

            <div className={`w-full max-w-[920px] h-[450px] bg-white rounded-2xl overflow-hidden`}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row">
                    <div className={`relative w-[450px] h-[450px] flex justify-center items-end pb-3`}>
                        <input id='imageInput' onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                                setSelectedFile(files[0])
                            }
                        }} className="text-black hidden" type="file" accept="image/*" />
                        {selectedFile && (
                            <Image
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                layout="fill"
                                objectFit="cover"
                                className="z-10"
                            />
                        )}
                        <label className="text-black z-20" htmlFor="imageInput">ВЫБРАТЬ КАРТИНКУ</label>
                    </div>

                    <div className="flex-1 w-full flex flex-col items-center gap-3 p-2 text-black">
                        <input className="w-3/4 text-center border-b-2 border-black outline-none focus:outline-none caret-black" {...register('name')} type="text" placeholder="НАЗВАНИЕ" />
                        <textarea {...register('description')} 
                            placeholder="ОПИСАНИЕ"
                            className="w-3/4 h-full resize-none outline-2 outline-black rounded-xl p-2 caret-black"
                         />

                        <select {...register('category')}>
                            {categories?.map((category, category_id) => (
                                <option key={category_id} value={`${category.id}`} >{category.name}</option>
                            ))}
                        </select>

                        <div className="caret-transparent flex flex-row gap-4">
                            <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                                <input {...register('kcal')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                                <span className="select-none">ККал</span>
                            </div>

                            <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                                <input {...register('proteins')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                                <span className="select-none">Белки</span>
                            </div>

                            <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                                <input {...register('carbohydrates')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                                <span className="select-none">Углеводы</span>
                            </div>

                            <div className="relative w-[90px] h-[65px] flex flex-col items-center justify-between p-1 bg-[#ffa685] rounded-xl">
                                <input {...register('fats')} className="text-center w-[80px] border-b-2 border-black outline-0 caret-black outline-none focus:outline-none" type="text" />
                                <span className="select-none">Жиры</span>
                            </div>
                        </div>

                        <div className="w-full flex justify-between ">
                            <div className="relative caret-transparent">
                                <input
                                    {...register('weight')}
                                    className="caret-black text-center w-[80px] border-b-2 border-black outline-none focus:outline-none"
                                    type="text"
                                    placeholder="Грамм"
                                />
                                
                                <span className="text-2xl font-light text-black select-none">г</span>
                            </div>

                            <div className="relative caret-transparent">
                                <input {...register('price')} 
                                    className="caret-black text-center w-[80px] border-b-2 border-black outline-none focus:outline-none"
                                    type="text" 
                                />

                                <span className="text-2xl font-light text-black select-none">￥</span>
                            </div>
                        </div>

                        <button type="submit" className="cursor-pointer">
                            Add dish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
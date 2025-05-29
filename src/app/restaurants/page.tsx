'use client';
import { Header } from "@/app/components/header";
import { useRestaurants } from "@/lib/hooks/useRestaurants";
import { useState } from "react";
import Link from "next/link";

export default function Restaurants() {

    const { restaurants } = useRestaurants();
    
    console.log(restaurants)

    return (
        <div className="mt-[100px] font-[family-name:var(--font-pacifico)] caret-transparent">
            <Header />
            <div className="relative min-h-[calc(100vh-100px)] h-full w-full flex flex-row justify-center bg-[#e4c3a2] px-2 pt-5">
                {/* {restaurants.map((item) => (
                    <div key={item.id}>
                        <Link href={`/restaurants/${item.id}`}>{item.name}</Link>
                    </div>
                ))} */}

                <div className="max-w-[1110px] w-full">
                    {restaurants.map((item) => (
                        <div key={item.id} className="overflow-hidden max-h-[300px] h-full w-full bg-gray-800 flex flex-row rounded-2xl">
                            <div className="h-full w-[300px] bg-amber-50">

                            </div>

                            <div className="flex flex-col flex-1 w-full gap-3 p-3">
                                <h3 className="text-center">{item.name}</h3>
                                <div className="h-9/12">
                                    <p>{item.description}</p>
                                </div>
                                <div className="w-full flex justify-between">
                                    <span>{item.address}</span>
                                    <Link href={`/restaurants/${item.id}`}>Узнать больше</Link>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
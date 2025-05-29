'use client'

import { supabase } from "@/db/supabaseConfig";
import { useState, useEffect } from "react";
import { Categories } from "@/lib/interfaces/menu";

export function useCategories() {
    const [categories, setCategories] = useState<Categories[]>([]);

    useEffect(() => {
        const getCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
            
            if (error) console.error(error);
            else {
                setCategories(data);
            }
        };

        getCategories();
    }, [])

    return { categories }
}
"use client";

import { supabase } from "@/db/supabaseConfig";
import { useEffect, useState } from "react";

export function useCheckUserRole() {

    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const getUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const userRole = await user?.user_metadata?.user_role || (await supabase.auth.getClaims()).data?.claims.user_role
            console.log(await supabase.auth.getClaims())
            if (userRole) {
                setUserRole(userRole);
            }
        }

        getUserRole();
    }, [])

    return { userRole };
}

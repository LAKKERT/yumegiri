"use client";

import { supabase } from "@/db/supabaseConfig";
import { useEffect, useState } from "react";

export function useCheckUserRole() {

    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const getRoleFunc = async () => {
            const { data: userData, error } = await supabase.auth.getUser();
            if (error) console.error(error);
            else {
                const { data: role, error } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", userData.user.id)
                    .single();
                if (error) console.error(error);
                else setUserRole(role.role);
            }
        }

        getRoleFunc();
    }, [])

    return { userRole };
}

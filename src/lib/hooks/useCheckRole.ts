"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState } from "react";

export function useCheckUserRole() {

    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const getUserRole = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;
            
            const userRole = await supabase.from('user_roles').select().eq('user_id', user?.id).single();

            if (userRole) {
                setUserRole(userRole.data.role);
            }
        }

        getUserRole();
    }, [])

    return { userRole };
}

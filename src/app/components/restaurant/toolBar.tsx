'use client';

import styles from '@/app/styles/reservatoin/variables.module.scss'
import { supabase } from '@/db/supabaseConfig';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";

interface Props {
    changeEditMode: (mode: boolean) => void;
    restaurantId?: number;
}

export function RestaurantToolBar({ changeEditMode, restaurantId }: Props) {

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const setEditMode = () => {
        setIsEditMode(prev => !prev);
    };

    const setConfirm = () => {
        setConfirmDelete(prev => !prev);
    };

    useEffect(() => {
        changeEditMode(isEditMode);
    }, [isEditMode, changeEditMode]);

    const deleteRestaurant = async () => {
        const { error: DeleteRestaurantError } = await supabase
            .from('restaurant')
            .delete()
            .eq('id', restaurantId)
        if (DeleteRestaurantError) console.error(DeleteRestaurantError)
        else window.location.reload();
    }

    console.log(confirmDelete)

    return (
        <div className='flex flex-col items-center z-40'>
            <div className="flex flex-row gap-4 p-4">
                <button type='button' className={`${styles.restaurant_button} cursor-pointer`} onClick={setEditMode}>
                    Редактировать
                </button>

                <button type='button' className={`${styles.delete_button} cursor-pointer`} onClick={setConfirm}>
                    Удалить
                </button>

            </div>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                    height: confirmDelete ? 'auto' : '0px',
                    opacity: confirmDelete ? 1 : 0,
                }}
                transition={{
                    duration: .3
                }}
                className={`flex flex-col items-center ${confirmDelete ? 'gap-4' : ''}`}
            >
                <motion.p
                    initial={{ height: 0 }}
                    animate={{
                        height: confirmDelete ? 'auto' : '0px',
                    }}
                    transition={{
                        duration: .3
                    }}
                    className='text-lg font-[family-name:var(--font-arimo)] select-none'>Вы уверены, что хотите удалить ресторан
                </motion.p>
                <div className={`flex flex-row gap-4`}>
                    <button type='button' disabled={confirmDelete ? false : true} className={`${styles.restaurant_button} ${confirmDelete ? 'cursor-pointer' : 'select-none cursor-default'}`} onClick={() => setConfirmDelete(false)}>
                        НЕТ
                    </button>

                    <button type='button' disabled={confirmDelete ? false : true} className={`${styles.restaurant_button} ${confirmDelete ? 'cursor-pointer' : 'select-none cursor-default'}`} onClick={deleteRestaurant}>
                        ДА
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
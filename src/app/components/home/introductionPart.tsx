'use client';

import Image from "next/image";

export function InrtoductionPart() {

    return (
        <div className="relative h-screen">
            <h1 className="absolute text-3xl lg:text-6xl font-[family-name:var(--font-kiwimaru)] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 [text-shadow:0_4px_4px_rgb(0_0_0_/_0.5)]">こんにちは</h1>
            <Image className="absolute left-[10%] top-[25%] lg:top-[15%] w-[30%] h-auto scale-110" src={'/home/cloud_6.png'} alt="cloud" width={350} height={230}/>
            <Image className="absolute right-[15%] bottom-[25%] lg:bottom-[10%] w-[30%]" src={'/home/cloud.png'} alt="cloud" width={350} height={230} />
            <Image className="absolute right-[15%] top-[15%] lg:top-[5%] w-[30%]" src={'/home/cloud_3.png'} alt="cloud" width={350} height={230} />
            <Image className="absolute bottom-[20%] lg:bottom-[10%] left-[15%] w-[30%]" src={'/home/cloud_4.png'} alt="cloud" width={350} height={230} />
        </div>
    )
}
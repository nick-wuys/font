import Image from "next/image";

import { Nav } from "../nav";
import Logo from "@/resources/logo.png";

export const Header = () => {
    return (
        <div className="mb-12">
            <header className="py-8 flex items-center justify-between shadow-md px-32 position-sticky top-0 z-50 bg-white fixed w-full">
                <div>
                    <Image src={Logo} alt="Logo" width={100} height={80} />
                </div>
                <Nav />
            </header>
            <div className="h-[144px] w-full"></div>
        </div>
    );
};

"use client";
import { usePathname } from "next/navigation";
import classname from "classnames";

const NavList = [
    {
        name: "Blog",
        path: "/",
    },
    {
        name: "关于",
        path: "/about",
    },
    {
        name: "创作",
        path: "/create",
    },
];

export const Nav = () => {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-3.5">
            {NavList.map((item, index) => {
                return (
                    <div
                        key={index}
                        className={classname("text-xl font-medium p-2", {
                            "text-blue-500 border-b border-blue-500":
                                pathname === item.path,
                        })}
                    >
                        <a href={item.path}>{item.name}</a>
                    </div>
                );
            })}
        </div>
    );
};

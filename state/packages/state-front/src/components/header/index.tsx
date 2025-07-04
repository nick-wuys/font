import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";
import { map } from "lodash-es";
import classNames from "classnames";
import router from "next/router";

const navs = [
    {
        name: "State",
        path: "/",
    },
    {
        name: "Withdraw",
        path: "/withdraw",
    },
];

export const Header = () => {
    const path = usePathname();

    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 relative z-10">
            <div className="text-2xl">MetaNodeState</div>
            <div className="flex items-center gap-4">
                {map(navs, (nav: { name: string; path: string }) => (
                    <div
                        key={nav.path}
                        className={classNames("cursor-pointer px-4 py-2 rounded-md", {
                            "text-blue-500 font-bold": path === nav.path,
                            "text-gray-500": path !== nav.path,
                        })}
                        onClick={() => router.replace(nav.path)}
                    >
                        {nav.name}
                    </div>
                ))}
                <ConnectButton />
            </div>
        </div>
    );
};

"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/zustand/userStore";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Menu } from "lucide-react";
import { UserProfileFetcher } from "@/helper/fetchUserProfile";

export default function Navbar() {
    const router = useRouter();
    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);
    const point = useUserStore((state) => state.point);
    const setPoint = useUserStore((state) => state.setPoint);


    const [open, setOpen] = useState(false);

    const handleLogin = () => {
        router.push("/login");
    };

    const handleLogout = () => {
        localStorage.removeItem("tkn");
        setUsername(null);
        setPoint(0);
        router.replace("/");
    };

    const fetchDataUser = async () => {
        const userFetcher = new UserProfileFetcher();
        await userFetcher.fetch(setUsername, setPoint);
    }

    useEffect(() => {
        fetchDataUser();
    }, [])

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow relative">
            <div className="font-bold text-lg cursor-pointer active:scale-95 w-full" onClick={() => router.push("/")}>
                MyApp
            </div>
            {/* Desktop Center Menu */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-4">
                <Button variant="link" onClick={() => router.push("/events")} className="cursor-pointer">Events</Button>
                {/* <Link href="/events" className="hover:underline">Events</Link> */}
                {username && (
                    <>
                        <Button variant="link" onClick={() => router.push("/dashboard")} className="cursor-pointer">Dashboard</Button>
                        <Button variant="link" onClick={() => router.push("/transactions")} className="cursor-pointer">Transactions</Button>
                    </>
                )}
            </div>
            {/* Desktop Right User Info */}
            <div className="hidden md:flex items-center gap-4 w-full justify-end">
                {username && point ? (
                    <>
                        <Badge>
                            Your Point : {point}
                        </Badge>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" className="cursor-pointer active:scale-95" onClick={() => router.push("/dashboard")} />
                        </Avatar>
                        {/* <span>{username}</span> */}
                        <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <Button onClick={handleLogin}>Login</Button>
                )}
            </div>
            {/* Hamburger Icon & Mobile Menu */}
            <button
                className="md:hidden flex items-center"
                onClick={() => setOpen(!open)}
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>
            {open && (
                <div className="absolute top-full right-0 bg-white shadow-md rounded-lg p-4 flex flex-col gap-3 w-48 z-50 md:hidden">
                    <Button variant="ghost" onClick={() => { router.push("/events"); setOpen(false); }}>Events</Button>
                    {username && (
                        <>
                            <Button variant="ghost" onClick={() => { router.push("/dashboard"); setOpen(false); }}>Dashboard</Button>
                            <Button variant="ghost" onClick={() => { router.push("/transactions"); setOpen(false); }} className="cursor-pointer">Transactions</Button>
                        </>
                    )}
                    {username && point ? (
                        <>
                            <Badge>
                                Your Point : {point}
                            </Badge>
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" className="cursor-pointer active:scale-95" onClick={() => { router.push("/dashboard"); setOpen(false); }} />
                            </Avatar>
                            <span>{username}</span>
                            <Button variant="outline" onClick={() => { handleLogout(); setOpen(false); }}>Logout</Button>
                        </>
                    ) : (
                        <Button onClick={() => { handleLogin(); setOpen(false); }}>Login</Button>
                    )}
                </div>
            )}
        </nav>
    );
}
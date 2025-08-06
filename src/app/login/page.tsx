"use client"
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/helper/apiCall";
import { useUserStore } from "@/lib/zustand/userStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LoginPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const setUsername = useUserStore((state) => state.setUsername);
    const setPoint = useUserStore((state) => state.setPoint);

    const handleLogin = async () => {
        try {
            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;
            if (!email || !password) {
                alert("Please fill in all fields");
                return;
            }
            const res = await apiCall.post("/auth/signin", {
                email,
                password,
            });

            if (!res.data.success) {
                alert(res.data.message);
                return;
            }
            console.log(res.data.result);

            localStorage.setItem("tkn", res.data.result.token);
            // localStorage.setItem("username", res.data.result.username);
            setUsername(res.data.result.username);
            setPoint(res.data.result.point);

            alert("Welcome!");
            router.replace("/");
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("Login failed. Please try again.");
            }
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("tkn");
        if (token) {
            router.replace("/");
        }
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center">
            <Card className="w-full max-w-sm h-fit">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                    <CardAction>
                        <Button variant="link" className="cursor-pointer">Sign Up</Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    ref={emailRef}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        <Button variant="link" className="cursor-pointer">
                                            Forgot your password?
                                        </Button>
                                    </Link>
                                </div>
                                <Input id="password" type="password" required ref={passwordRef} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full cursor-pointer" onClick={handleLogin}>
                        Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
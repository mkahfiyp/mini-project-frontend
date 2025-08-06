"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/zustand/userStore"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, User, LogOut, Calendar, BarChart3, CreditCard, X } from 'lucide-react'
import { UserProfileFetcher } from "@/helper/fetchUserProfile"

// Custom Loading Skeleton Component
const LoadingSkeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

export default function Navbar() {
    const router = useRouter()
    const username = useUserStore((state) => state.username)
    const setUsername = useUserStore((state) => state.setUsername)
    const point = useUserStore((state) => state.point)
    const setPoint = useUserStore((state) => state.setPoint)

    const [isLoading, setIsLoading] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    const handleLogin = useCallback(() => {
        router.push("/login")
        setIsMobileMenuOpen(false)
    }, [router])

    const handleLogout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("tkn")
        }
        setUsername(null)
        setPoint(0)
        router.replace("/")
        setIsMobileMenuOpen(false)
    }, [router, setUsername, setPoint])

    const fetchDataUser = useCallback(async () => {
        try {
            setIsLoading(true)
            const userFetcher = new UserProfileFetcher()
            await userFetcher.fetch(setUsername, setPoint)
        } catch (error) {
            console.error("Failed to fetch user data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [setUsername, setPoint])

    const navigateTo = useCallback((path: string) => {
        router.push(path)
        setIsMobileMenuOpen(false)
    }, [router])

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false)
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false)
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isMobileMenuOpen])

    useEffect(() => {
        fetchDataUser()
    }, [fetchDataUser])

    const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
        const linkClass = isMobile
            ? "w-full justify-start gap-3 h-12 text-left"
            : "cursor-pointer"

        return (
            <>
                <Button
                    variant={isMobile ? "ghost" : "link"}
                    onClick={() => navigateTo("/events")}
                    className={linkClass}
                >
                    {isMobile && <Calendar className="w-4 h-4" />}
                    Events
                </Button>
                {username && (
                    <>
                        <Button
                            variant={isMobile ? "ghost" : "link"}
                            onClick={() => navigateTo("/dashboard")}
                            className={linkClass}
                        >
                            {isMobile && <BarChart3 className="w-4 h-4" />}
                            Dashboard
                        </Button>
                        <Button
                            variant={isMobile ? "ghost" : "link"}
                            onClick={() => navigateTo("/transactions")}
                            className={linkClass}
                        >
                            {isMobile && <CreditCard className="w-4 h-4" />}
                            Transactions
                        </Button>
                    </>
                )}
            </>
        )
    }

    const UserSection = ({ isMobile = false }: { isMobile?: boolean }) => {
        if (isLoading) {
            return (
                <div className={`flex items-center gap-3 ${isMobile ? 'flex-col w-full' : ''}`}>
                    <LoadingSkeleton className="h-8 w-20" />
                    <LoadingSkeleton className="h-8 w-8 rounded-full" />
                    <LoadingSkeleton className="h-8 w-16" />
                </div>
            )
        }

        if (username && point !== undefined) {
            return (
                <div className={`flex items-center gap-3 ${isMobile ? 'flex-col w-full' : ''}`}>
                    <Badge variant="secondary" className={isMobile ? 'w-full justify-center' : ''}>
                        Your Point: {point}
                    </Badge>
                    <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            onClick={() => navigateTo("/dashboard")}
                            alt={`${username}'s avatar`}
                        />
                        <AvatarFallback>
                            <User className="w-4 h-4" />
                        </AvatarFallback>
                    </Avatar>
                    {isMobile && (
                        <span className="text-sm font-medium text-center">{username}</span>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className={`${isMobile ? 'w-full gap-2' : ''}`}
                    >
                        {isMobile && <LogOut className="w-4 h-4" />}
                        Logout
                    </Button>
                </div>
            )
        }

        return (
            <Button
                onClick={handleLogin}
                className={isMobile ? 'w-full gap-2' : ''}
            >
                {isMobile && <User className="w-4 h-4" />}
                Login
            </Button>
        )
    }

    return (
        <>
            <nav className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
                <div className="container flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigateTo("/")}
                            className="text-xl font-bold hover:bg-transparent p-2"
                        >
                            EVENT
                        </Button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center flex-1 gap-1">
                        <NavLinks />
                    </div>

                    {/* Desktop User Section */}
                    <div className="hidden md:flex items-center">
                        <UserSection />
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />

                    {/* Mobile Menu */}
                    <div
                        ref={mobileMenuRef}
                        className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Navigation</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close navigation menu"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Menu Content */}
                        <div className="flex flex-col gap-4 p-4">
                            <div className="flex flex-col gap-2">
                                <NavLinks isMobile />
                            </div>
                            <div className="border-t pt-4">
                                <UserSection isMobile />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

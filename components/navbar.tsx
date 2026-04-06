"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
    boardTitle: string;
    onEditBoard?: () => void;
    onFilterClick?: () => void;
    filterCount?: number;
}

export default function Navbar({ boardTitle, onEditBoard, onFilterClick, filterCount }: Props) {
    const { isSignedIn, user } = useUser();
    const pathname = usePathname();

    const isDashboardPage = pathname === "/dashboard";
    const isBoardPage = pathname.startsWith("/boards/");

    if (isDashboardPage) {
        return (
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between h-14">

                    <div className="flex items-center space-x-2">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                            Trello Clone
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {isSignedIn ? (
                            <UserButton afterSignOutUrl="/" />
                        ) : (
                            <>
                                <SignInButton>
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </SignInButton>

                                <SignUpButton>
                                    <Button size="sm">
                                        Sign Up
                                    </Button>
                                </SignUpButton>
                            </>
                        )}
                    </div>

                </div>
            </header>
        );
    }

    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between h-14">

                <div className="flex items-center space-x-2 min-w-0">

                    {isBoardPage && (
                        <Link
                            href="/dashboard"
                            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                    )}

                    {isBoardPage && (
                        <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
                    )}

                    {isBoardPage && (
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                            <span className="text-blue-600">●</span>
                            <span className="text-lg font-bold text-gray-900 truncate">
                                {boardTitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {onEditBoard && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={onEditBoard}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    )}

                    {isSignedIn && <UserButton afterSignOutUrl="/" />}
                </div>

            </div>
        </header>
    );
}
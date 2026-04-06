"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface NavbarProps {
  boardTitle?: string;
  boardColor?: string;
  onEditBoard?: () => void;
  onFilterClick?: () => void;
  filterCount?: number;
  className?: string;
}

const Navbar = ({
  boardTitle,
  boardColor,
  onEditBoard,
  onFilterClick,
  filterCount,
  className,
}: NavbarProps) => {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  if (isDashboardPage) {
    return (
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                KaryaSetu
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  if (isBoardPage) {
    return (
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline font-medium">Back to dashboard</span>
                <span className="sm:hidden font-medium">Back</span>
              </Link>
              <div className="h-4 sm:h-5 w-px bg-border hidden sm:block" />
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-md ${boardColor ?? "bg-blue-500"}`} />
                <div className="items-center space-x-2 min-w-0">
                  <span className="text-lg sm:text-xl font-bold text-foreground truncate">
                    {boardTitle}
                  </span>
                  {onEditBoard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 flex-shrink-0 p-0 cursor-pointer text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all"
                      onClick={onEditBoard}
                    >
                      <MoreHorizontal />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {onFilterClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilterClick}
                  className={`text-xs sm:text-sm cursor-pointer border-border text-muted-foreground transition-all ${filterCount && filterCount > 0
                    ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
                    : "hover:bg-accent/50 hover:border-primary/50"
                    }`}
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline font-medium">Filter</span>
                  {filterCount && filterCount > 0 && (
                    <Badge
                      variant={"secondary"}
                      className="text-xs ml-1 sm:ml-2 bg-primary/20 border-primary/40 text-primary font-medium"
                    >
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              )}
              <UserButton />
            </div>
          </div>
          <div className="flex sm:hidden mt-4 justify-center items-center space-x-2 min-w-0">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 shadow-md ${boardColor ?? "bg-blue-500"}`} />
            <div className="items-center space-x-2 min-w-0">
              <span className="text-lg font-bold text-foreground truncate">
                {boardTitle}
              </span>
              {onEditBoard && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 flex-shrink-0 p-0 cursor-pointer text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all"
                  onClick={onEditBoard}
                >
                  <MoreHorizontal />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <LayoutDashboard className="h-6 w-6 sm:w-8 sm:h-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              {" "}
              KaryaSetu
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div>
            {isSignedIn ? (
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
                  Welcome,{" "}
                  {user?.firstName ?? user?.emailAddresses[0].emailAddress}
                </span>
                <Link href="/dashboard">
                  <Button size="sm" className="text-xs sm:text-sm cursor-pointer bg-primary hover:bg-orange-600 text-primary-foreground">
                    Go to Dashboard <ArrowRight />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="text-xs sm:text-sm cursor-pointer bg-primary hover:bg-orange-600 text-primary-foreground"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

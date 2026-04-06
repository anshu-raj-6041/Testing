"use Client";

import { HeaderSkeleton } from "@/components/skeletons/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onCreateBoard: () => void;
  loading: boolean;
}

export function DashboardHeader({
  onCreateBoard,
  loading,
}: DashboardHeaderProps) {
  const { user } = useUser();

  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3">
        Welcome back, {user?.firstName ?? user?.emailAddresses[0].emailAddress}!
        👋
      </h1>
      <p className="text-base sm:text-lg text-gray-400 mb-4">
        Here's what's happening with your boards today.
      </p>
      <Button
        className="w-full sm:w-auto mt-2 cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 text-white font-semibold"
        onClick={onCreateBoard}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Board
      </Button>
    </div>
  );
}

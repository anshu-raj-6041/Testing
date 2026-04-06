"use client";

import { StatsSkeleton } from "@/components/skeletons/Stats";
import { Card, CardContent } from "@/components/ui/card";
import { Board } from "@/lib/supabase/models";
import { ChartLine, Rocket, LayoutDashboard } from "lucide-react";

interface StatsSectionProps {
  boards: Board[];
  loading: boolean;
}

export function StatsSection({ boards, loading }: StatsSectionProps) {
  if (loading) {
    return <StatsSkeleton />;
  }

  const recentActivityCount = boards.filter((board) => {
    const updatedAt = new Date(board.updated_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return updatedAt >= oneWeekAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-300">
                Total Boards
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                {boards.length}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur-sm hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-300">
                Active Projects
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                {boards.length}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-300">
                Recent Activity
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                {recentActivityCount}
              </p>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ChartLine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-sm hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-300">
                Total Tasks
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
                {boards.reduce((sum, b) => sum + (b.totalTasks || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { BoardsSkeleton } from "@/components/skeletons/Boards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Board } from "@/lib/supabase/models";
import { Filter, Grid3X3, List, Plus, Search, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface BoardsSectionProps {
  boards: Board[];
  loading: boolean;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFilterClick: () => void;
  onCreateBoard: () => void;
  activeFilterCount: number;
  isFreeUser: boolean;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export function BoardsSection({
  boards,
  loading,
  viewMode,
  onViewModeChange,
  onFilterClick,
  onCreateBoard,
  activeFilterCount,
  isFreeUser,
  onSearchChange,
  searchValue,
}: BoardsSectionProps) {
  if (loading) {
    return <BoardsSkeleton />;
  }
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Your Boards
          </h2>
          <p className="text-base text-gray-400 mt-1">Manage your projects and tasks</p>
          {isFreeUser && (
            <p className="text-sm text-orange-400 mt-2 font-medium">
              Free Plan: {boards.length}/1 boards used
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 bg-gray-800/30 border border-gray-700/50 p-1 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`cursor-pointer ${viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-gray-700/50 text-gray-300"}`}
            >
              <Grid3X3 />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`cursor-pointer ${viewMode === "list" ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-gray-700/50 text-gray-300"}`}
            >
              <List />
            </Button>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="py-5 cursor-pointer border-gray-600/50 text-gray-300 hover:bg-gray-700/30 hover:text-white hover:border-gray-500"
            onClick={onFilterClick}
          >
            <Filter />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant={"outline"} className="border-orange-500 bg-orange-500/20 text-orange-400">{activeFilterCount}</Badge>
            )}
          </Button>
          <Button onClick={onCreateBoard} className="py-5 cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 text-white font-semibold">
            <Plus />
            Create Board
          </Button>
        </div>
      </div>

      <div className="relative mb-6 sm:mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id="search"
          placeholder="Search boards by name..."
          className="pl-12 h-12 bg-gray-800/30 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 rounded-xl"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No boards yet</p>
          <p className="text-gray-500 text-sm mt-2">Create your first board to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {boards.map((board, key) => (
            <Link href={`/boards/${board.id}`} key={key}>
              <Card className="hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer group border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm hover:border-orange-500/60 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-3 h-3 rounded-full ${board.color} shadow-lg`} />
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium">
                      New
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-xl mb-3 group-hover:text-orange-400 transition-colors text-white font-bold">
                    {board.title}
                  </CardTitle>
                  <CardDescription className="text-sm mb-4 text-gray-400 line-clamp-2">
                    {board.description || "No description"}
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 space-y-1 sm:space-y-0 pt-3 border-t border-gray-700/50">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {new Date(board.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Card
            className="border-2 border-dashed border-gray-600/50 hover:border-orange-500/70 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm hover:bg-gray-800/30 hover:-translate-y-1"
            onClick={onCreateBoard}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px] box-border">
              <div className="w-12 h-12 rounded-xl bg-gray-700/50 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-orange-400" />
              </div>
              <p className="text-base text-gray-400 font-semibold group-hover:text-orange-400 transition-colors">
                Create new board
              </p>
              <p className="text-xs text-gray-500 mt-1">Start organizing your tasks</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          {boards.map((board, key) => (
            <div key={key} className={key > 0 ? "mt-4" : ""}>
              <Link href={`/boards/${board.id}`}>
                <Card className="hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer group border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm hover:border-orange-500/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-3 h-3 rounded-full ${board.color} shadow-lg`} />
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/40 font-medium">
                        New
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-xl mb-3 group-hover:text-orange-400 transition-colors text-white font-bold">
                      {board.title}
                    </CardTitle>
                    <CardDescription className="text-sm mb-4 text-gray-400 line-clamp-2">
                      {board.description || "No description"}
                    </CardDescription>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 space-y-1 sm:space-y-0 pt-3 border-t border-gray-700/50">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {new Date(board.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(board.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
          <Card
            className="mt-4 border-2 border-dashed border-gray-600/50 hover:border-orange-500/70 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm hover:bg-gray-800/30"
            onClick={onCreateBoard}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
              <div className="w-12 h-12 rounded-xl bg-gray-700/50 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 transition-colors">
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-orange-400" />
              </div>
              <p className="text-base text-gray-400 font-semibold group-hover:text-orange-400 transition-colors">
                Create new board
              </p>
              <p className="text-xs text-gray-500 mt-1">Start organizing your tasks</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

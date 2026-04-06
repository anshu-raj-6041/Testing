"use client";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import { Activity, Filter, Grid3X3, List, Plus, Rocket, Search, Trello } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const { boards, createBoard, error } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" })
  }

  if (error) {
    return (
      <div>
        <h2>Error loading boards</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.firstName ?? user?.emailAddresses[0].emailAddress}! 👋
          </h1>

          <p className="text-muted-foreground">
            Here what happening with your boards today.
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={handleCreateBoard}>
          <Plus className="h-4 w-4 mr-2" />
          Create Board
        </Button>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {boards.filter((board) => {
                      const updatedAt = new Date(board.updated_at)
                      const oneWeekAgo = new Date()
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                      return updatedAt > oneWeekAgo;
                    }).length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-accent/40 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {boards.filter((board) => {
                      const updatedAt = new Date(board.updated_at)
                      const oneWeekAgo = new Date()
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                      return updatedAt > oneWeekAgo;
                    }).length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Your Boards
            </h2>
            <p className="text-muted-foreground">Manage your projects and tasks</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
            <div className="flex items-center space-x-2 bg-card border border-border p-1 rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 />
              </Button>

              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List />
              </Button>
            </div>


            <Button variant="outline" size="sm">
              <Filter />
              Filter
            </Button>

            <Button onClick={handleCreateBoard} className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>


        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            id="search"
            placeholder="Search boards..."
            className="pl-10"
          />
        </div>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trello className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-4">Create your first board to get started</p>
            <Button onClick={handleCreateBoard}>
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-3 h-3 ${board.color} rounded-full`} />
                      <Badge className="text-xs" variant="secondary">New</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{board.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{board.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 border-t">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span className="font-medium">{new Date(board.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated</span>
                        <span className="font-medium">{new Date(board.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {boards.map((board, index) => (
              <div key={index} className={index > 0 ? "mt-4" : ""}>
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer hover:bg-accent/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 ${board.color} rounded-full flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="line-clamp-1">{board.title}</CardTitle>
                          <CardDescription className="line-clamp-1">{board.description || "No description"}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          Updated {new Date(board.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}

            <Card className="mt-4 border-2 border-dashed border-border hover:border-primary/40">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground group-hover:text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground">
                  Create New Board
                </p>
              </CardContent>
            </Card>



          </div>
        )}
      </main>
    </div>
  );
}

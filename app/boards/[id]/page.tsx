"use client";
// Hello World Anshu
import Navbar from "@/components/layout/Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBoard } from "@/features/boards/hooks/useBoard";
import { FilterDialog } from "@/features/boards/components/FilterDialog";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
// import { Check, Plus } from "lucide-react";

const BOARD_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-gray-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-emerald-500",
];

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { board, columns, updateBoard } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("bg-blue-500");
  const [isSaving, setIsSaving] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const filterCount =
    filters.priority.length +
    filters.assignee.length +
    (filters.dueDate ? 1 : 0);

  const handleFilterChange = (
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      priority: [],
      assignee: [],
      dueDate: null,
    });
  };

  useEffect(() => {
    if (board) {
      setNewTitle(board.title);
      setNewColor(board.color);
    }
  }, [board]);

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) {
      console.log("Validation failed: title or board missing");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Updating board:", { id: board.id, title: newTitle, color: newColor });

      const result = await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });

      console.log("Update result:", result);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update board:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to update board"}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        boardTitle={board?.title}
        boardColor={board?.color}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
          setNewColor(board?.color ?? "bg-blue-500");
          setIsEditingTitle(true);
        }}
        onFilterClick={() => setIsFilterOpen(true)}
        filterCount={filterCount}
      />

      <main className="container mx-auto px-4 py-6">

        <div className="bg-card rounded-lg border border-border shadow p-6">
          <p className="text-muted-foreground">Board content coming soon...</p>
        </div>
      </main>

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBoard} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Board Title</Label>
              <Input
                id="boardTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter Board Title..."
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Board Color</Label>
              <div className="grid grid-cols-6 gap-3">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`w-10 h-10 rounded-full ${color} relative transition-transform hover:scale-110 flex items-center justify-center`}
                  >
                    {newColor === color && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingTitle(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-black hover:bg-gray-900 disabled:bg-gray-400"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Total Tasks:</span>
              {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus />
              Add Task
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Add a task to the board
              </p>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Enter task title" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Enter task description" 
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input 
                  id="assignee" 
                  name="assignee" 
                  placeholder="Who should do this?" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  type="date" 
                  id="dueDate" 
                  name="dueDate" 
                  placeholder="yyyy-mm-dd" 
                />
              </div>

              <div>
                <Button type="submit" className="w-full cursor-pointer">
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { DisplayProduct } from "./types"

const capitalizeFirstLetter = (str: string | null | undefined): string => {
  if (!str) return "Not Set";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const columns = (updateTurnoverCategory: (productId: string, newTurnover: string | null) => void): ColumnDef<DisplayProduct>[] => [
  {
    id: "brandName",
    header: "Brand Name",
    accessorFn: (row: DisplayProduct) => row.brandName,
    filterFn: "arrIncludesSome",
  },
  {
    id: "model",
    header: "Model",
    accessorFn: (row: DisplayProduct) => row.referenceNumber,
    filterFn: "arrIncludesSome",
  },
  {
    id: "modelName",
    header: "Model Name",
    accessorFn: (row: DisplayProduct) => row.modelName,
    filterFn: "arrIncludesSome",
  },
  {
    id: "platform",
    header: "Platform",
    accessorFn: (row: DisplayProduct) => row.platform,
  },
  {
    id: "turnoverCategory",
    header: "Turnover Category",
    accessorFn: (row: DisplayProduct) => capitalizeFirstLetter(row.turnoverCategory), // Gunakan fungsi kapitalisasi
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter();
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [selectedTurnover, setSelectedTurnover] = useState(row.original.turnoverCategory || "");

      const handleSaveTurnover = () => {
        const newTurnover = selectedTurnover === "" ? null : selectedTurnover;
        updateTurnoverCategory(row.original.productId!, newTurnover);
        setIsEditOpen(false);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/product/${row.original.productId}`)}>
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Turnover Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="turnover" className="text-right">
                    Turnover Category
                  </Label>
                  <Select
                    value={selectedTurnover}
                    onValueChange={setSelectedTurnover}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTurnover}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
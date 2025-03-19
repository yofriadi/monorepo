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
import { DisplayProduct, TurnoverCategory } from "./types"


export const columns = (updateTurnoverCategory: (productId: string, newTurnover: TurnoverCategory | null) => void): ColumnDef<DisplayProduct>[] => [
  {
    id: "brandName",
    header: "Brand Name",
    accessorFn: (row: DisplayProduct) => row.brandName,
    filterFn: "arrIncludesSome",
  },
  {
    id: "modelName",
    header: "Model Name",
    accessorFn: (row: DisplayProduct) => row.modelName,
    filterFn: "arrIncludesSome",
  },
  {
    id: "referenceNumber",
    header: "Reference Number",
    accessorFn: (row: DisplayProduct) => row.referenceNumber,
    filterFn: "arrIncludesSome",
  },
  {
    id: "turnoverCategory",
    header: "Turnover Category",
    accessorFn: (row: DisplayProduct) => {
      if (!row.turnoverCategory) return "Not Set";
      return row.turnoverCategory.charAt(0).toUpperCase() + row.turnoverCategory.slice(1);
    },
    filterFn: "equalsString",
  },
  {
    id: "lastScrapedDate",
    header: "Last Scraped Date",
    accessorFn: (row: DisplayProduct) => row.updatedAt || row.createdAt,
    cell: ({ row }) => {
      const date = row.original.updatedAt || row.original.createdAt;
      return date ? new Date(date).toLocaleDateString() : '';
    },
    filterFn: "inNumberRange",
  },
  {
    // This column will be hidden by default but accessible for other columns
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "avgPrice",
    header: "Avg Price",
    cell: ({ row }) => {
      const currency = row.getValue("currency") as string || "";
      const price = row.getValue("avgPrice") as string;
      return `${currency}${parseFloat(price).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    },
  },
  {
    accessorKey: "minPrice",
    header: "Min Price",
    cell: ({ row }) => {
      const price = row.getValue("minPrice") as string;
      const currency = row.getValue("currency") as string || "";
      return price ? `${currency}${parseFloat(price).toLocaleString()}` : "-";
    },
  },
  {
    accessorKey: "maxPrice",
    header: "Max Price",
    cell: ({ row }) => {
      const price = row.getValue("maxPrice") as string;
      const currency = row.getValue("currency") as string || "";
      return price ? `${currency}${parseFloat(price).toLocaleString()}` : "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter();
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [selectedTurnover, setSelectedTurnover] = useState<string>(row.original.turnoverCategory || "");

      const handleSaveTurnover = () => {
        const newTurnover = selectedTurnover === "" ? null : selectedTurnover as TurnoverCategory;
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
                    <SelectItem value={TurnoverCategory.SLOW}>Slow</SelectItem>
                      <SelectItem value={TurnoverCategory.MODERATE}>Moderate</SelectItem>
                      <SelectItem value={TurnoverCategory.FAST}>Fast</SelectItem>
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

"use client"

import { type LookupPrice } from "../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@workspace/ui/components/alert-dialog"
import { useState } from "react"
import { DataDialog } from "./data-dialog"

interface LookupPriceTableProps {
  title: string
  data: LookupPrice[]
  onEdit: (id: string, { parameter, value }: { parameter: string; value: number }) => void
  onDelete: (id: string) => void
}

export function LookupPriceTable({ title, data, onEdit, onDelete }: LookupPriceTableProps) {
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<LookupPrice | null>(null)

  const handleDelete = () => {
    if (deleteItemId) {
      onDelete(deleteItemId)
      setDeleteItemId(null)
    }
  }

  return (
    <>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.parameter}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteItemId(item.parameter)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DataDialog
        title={`Edit ${title}`}
        initialData={{
          parameter: editingItem?.parameter || '',
          value: editingItem?.value || 0
        }}
        onSubmit={(formData) => {
          if (editingItem) {
            onEdit(editingItem.id, { parameter: formData.parameter, value: formData.value })
          }
        }}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      />

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this lookup price.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

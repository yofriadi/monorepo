"use client"

import { type LookupPrice } from "@/types/lookup-price"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"
import { useState } from "react"
import { DataDialog } from "./data-dialog"

interface LookupPriceTableProps {
  title: string
  data: LookupPrice[]
  onEdit: (id: string, { value }: { value: number }) => void
}

interface EditableLookupPrice {
  id: string
  parameter: string
  value: number
}

export function LookupPriceTable({ title, data, onEdit }: LookupPriceTableProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<EditableLookupPrice>({
    id: "",
    parameter: "",
    value: 0,
  })

  return (
    <>
      <div className="rounded-lg border m-8">
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
                      <DropdownMenuItem onClick={() => {
                        setEditingItem(item)
                        setIsEditing(true)
                      }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="text-muted-foreground">
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
        title={title}
        initialData={{ value: editingItem.value }}
        parameter={editingItem.parameter}
        onSubmit={(formData) => {
          onEdit(editingItem.id, { value: formData.value })
          setIsEditing(false)
        }}
        open={isEditing}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditing(false)
          }
        }}
      />
    </>
  )
}

"use client"

import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "condition", label: "Condition" },
  { key: "code", label: "Code" },
]

const fields = [
  { key: "condition", label: "Condition" },
  { key: "code", label: "Code" },
]

interface ConditionData {
  id: number
  condition: string
  code: string
}

export default function ConditionPage() {
  const [data, setData] = useState<ConditionData[]>([
    { id: 1, condition: "Poor", code: "1" },
    { id: 2, condition: "Fair", code: "2" },
    { id: 3, condition: "Good", code: "3" },
    { id: 4, condition: "Like New", code: "4" },
    { id: 5, condition: "Excellent", code: "5" },
    { id: 6, condition: "New", code: "6" },
  ])
  const [editingItem, setEditingItem] = useState<ConditionData | null>(null)

  const handleAdd = (newItem: Omit<ConditionData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<ConditionData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: ConditionData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Condition Master Data</h1>
        <DataDialog title="Add Condition" fields={fields} onSubmit={handleAdd} />
      </div>
     
      <div className="rounded-md border">
        <DataTable
          data={data}
          columns={columns}
          onEdit={setEditingItem}
          onDelete={handleDelete}
        />
      </div>

      {editingItem && (
        <DataDialog
          title="Edit Condition"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            condition: editingItem.condition,
            code: editingItem.code
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
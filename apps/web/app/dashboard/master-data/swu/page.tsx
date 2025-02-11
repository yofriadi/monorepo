"use client"
import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "type", label: "Type" },
  { key: "code", label: "Code" },
]

const fields = [
  { key: "type", label: "Type" },
  { key: "code", label: "Code" },
]

interface SWUData {
  id: number
  type: string
  code: string
}

export default function SWUPage() {
  const [data, setData] = useState<SWUData[]>([
    { id: 1, type: "Direct Sell", code: "1" },
    { id: 2, type: "Trade In", code: "2" },
    { id: 3, type: "Consign", code: "3" },
    { id: 4, type: "Buy Back", code: "4" },
  ])
  const [editingItem, setEditingItem] = useState<SWUData | null>(null)

  const handleAdd = (newItem: Omit<SWUData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<SWUData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: SWUData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SWU Master Data</h1>
        <DataDialog title="Add Type" fields={fields} onSubmit={handleAdd} />
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
          title="Edit Type"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            type: editingItem.type,
            code: editingItem.code
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
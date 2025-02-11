"use client"
import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "dial", label: "Dial" },
  { key: "code", label: "Code" },
]

const fields = [
  { key: "dial", label: "Dial" },
  { key: "code", label: "Code" },
]

interface DialData {
  id: number
  dial: string
  code: string
}

export default function DialPage() {
  const [data, setData] = useState<DialData[]>([
    { id: 1, dial: "Black", code: "1" },
    { id: 2, dial: "Black Blue", code: "2" },
  ])
  const [editingItem, setEditingItem] = useState<DialData | null>(null)

  const handleAdd = (newItem: Omit<DialData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<DialData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: DialData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dial Master Data</h1>
        <DataDialog title="Add Dial" fields={fields} onSubmit={handleAdd} />
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
          title="Edit Dial"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            dial: editingItem.dial,
            code: editingItem.code
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
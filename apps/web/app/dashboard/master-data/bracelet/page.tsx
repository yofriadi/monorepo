"use client"
import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "bracelet", label: "Bracelet" },
  { key: "code", label: "Code" },
]

const fields = [
  { key: "bracelet", label: "Bracelet" },
  { key: "code", label: "Code" },
]

interface BraceletData {
  id: number
  bracelet: string
  code: string
}

export default function BraceletPage() {
  const [data, setData] = useState<BraceletData[]>([
    { id: 1, bracelet: "Alligator", code: "1" },
    { id: 2, bracelet: "Black & White Richard Mille Cloth Strap", code: "2" },
  ])
  const [editingItem, setEditingItem] = useState<BraceletData | null>(null)

  const handleAdd = (newItem: Omit<BraceletData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<BraceletData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: BraceletData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bracelet Master Data</h1>
        <DataDialog title="Add Bracelet" fields={fields} onSubmit={handleAdd} />
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
          title="Edit Bracelet"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            bracelet: editingItem.bracelet,
            code: editingItem.code
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
"use client"
import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "reference", label: "Reference Number" },
  { key: "code", label: "Code" },
]

const fields = [
  { key: "reference", label: "Reference Number" },
  { key: "code", label: "Code" },
]

interface ReferenceData {
  id: number
  reference: string
  code: string
}

export default function ReferencePage() {
  const [data, setData] = useState<ReferenceData[]>([
    { id: 1, reference: "116500LN", code: "31" },
    { id: 2, reference: "179384", code: "21" },
    { id: 3, reference: "126613LB", code: "55" },
    { id: 4, reference: "124300", code: "7" },
    { id: 5, reference: "126711CHNR", code: "59" },
  ])
  const [editingItem, setEditingItem] = useState<ReferenceData | null>(null)

  const handleAdd = (newItem: Omit<ReferenceData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<ReferenceData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: ReferenceData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reference Number Master Data</h1>
        <DataDialog title="Add Reference Number" fields={fields} onSubmit={handleAdd} />
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
          title="Edit Reference Number"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            reference: editingItem.reference,
            code: editingItem.code
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
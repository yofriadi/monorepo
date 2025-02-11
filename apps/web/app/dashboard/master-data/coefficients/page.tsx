"use client"
import { useState } from "react"
import { DataTable } from "../data-table"
import { DataDialog } from "../data-dialog"

const columns = [
  { key: "data", label: "Data" },
  { key: "coefficients", label: "Coefficients" },
]

const fields = [
  { key: "data", label: "Data" },
  { key: "coefficients", label: "Coefficients" },
]

interface CoefficientData {
  id: number
  data: string
  coefficients: string
}

export default function CoefficientsPage() {
  const [data, setData] = useState<CoefficientData[]>([
    { id: 1, data: "Intercept", coefficients: "-179652.652" },
    { id: 2, data: "Ref", coefficients: "-1.415" },
  ])
  const [editingItem, setEditingItem] = useState<CoefficientData | null>(null)

  const handleAdd = (newItem: Omit<CoefficientData, 'id'>) => {
    const newId = Math.max(0, ...data.map(item => item.id)) + 1
    setData([...data, { ...newItem, id: newId }])
  }

  const handleEdit = (editedItem: Omit<CoefficientData, 'id'>) => {
    setData(data.map((item) => 
      item.id === editingItem?.id ? { ...editedItem, id: editingItem.id } : item
    ))
    setEditingItem(null)
  }

  const handleDelete = (deletedItem: CoefficientData) => {
    setData(data.filter((item) => item.id !== deletedItem.id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coefficients Master Data</h1>
        <DataDialog title="Add Coefficient" fields={fields} onSubmit={handleAdd} />
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
          title="Edit Coefficient"
          fields={fields}
          onSubmit={handleEdit}
          initialData={{
            data: editingItem.data,
            coefficients: editingItem.coefficients
          }}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  )
}
"use client"
import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

interface DataDialogProps {
  title: string
  fields: { key: string; label: string }[]
  onSubmit: (data: any) => void
  initialData?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DataDialog({ 
  title, 
  fields, 
  onSubmit, 
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange 
}: DataDialogProps) {
  const [formData, setFormData] = useState(initialData || {})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (controlledOpen === undefined) {
      setOpen(false)
    }
    setFormData({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen)
    } else {
      setOpen(newOpen)
    }
    if (!newOpen) {
      setFormData({})
    }
  }

  const isControlled = controlledOpen !== undefined

  return (
    <Dialog 
      open={isControlled ? controlledOpen : open} 
      onOpenChange={handleOpenChange}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>{initialData ? "Edit" : "Add"}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.key} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.key} className="text-right">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
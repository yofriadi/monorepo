"use client"

import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

interface DataDialogProps {
  title: string
  onSubmit: (data: { value: number }) => void
  initialData?: { value: number }
  open?: boolean
  onOpenChange?: (open: boolean) => void
  parameter: string
}

export function DataDialog({ 
  title, 
  onSubmit, 
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  parameter
}: DataDialogProps) {
  const [formData, setFormData] = useState(initialData || { value: 0 })
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
    setFormData({ value: 0 })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen)
    } else {
      setOpen(newOpen)
    }
    if (!newOpen) {
      setFormData({ value: 0 })
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
          <Button>Edit</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parameter" className="text-right">
                Parameter
              </Label>
              <Input
                id="parameter"
                value={parameter}
                readOnly
                disabled
                className="col-span-3 bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
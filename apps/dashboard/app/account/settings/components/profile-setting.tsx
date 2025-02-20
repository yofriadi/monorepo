"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { useToast } from "@workspace/ui/hooks/use-toast"

export function ProfileSetting() {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const { toast } = useToast()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (avatar) {
        formData.append('avatar', avatar)
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to update profile')

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>Avatar</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="max-w-[250px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              className="max-w-[250px]"
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateMenuItemSchema } from "@/lib/validations/menu"
import { updateMenuItem } from "@/lib/actions/menu-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Pencil, UtensilsCrossed, ImagePlus, X } from "lucide-react"
import Image from "next/image"

export function EditMenuDialog({ item, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(item.imageUrl || null)
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "")
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateMenuItemSchema),
    defaultValues: {
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable,
      })
      setImagePreview(item.imageUrl || null)
      setImageUrl(item.imageUrl || "")
    }
  }, [item, open, reset])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        setImageUrl(data.url)
        setValue("imageUrl", data.url)
        toast.success("Image updated successfully")
      } else {
        toast.error(data.error || "Image upload failed")
        setImagePreview(item.imageUrl || null)
      }
    } catch {
      toast.error("Image upload failed")
      setImagePreview(item.imageUrl || null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageUrl("")
    setValue("imageUrl", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await updateMenuItem(item.id, { ...data, imageUrl })
      if (result.success) {
        toast.success("Menu item updated successfully")
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update item")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UtensilsCrossed className="h-5 w-5" />
            <DialogTitle>Edit Menu Item</DialogTitle>
          </div>
          <DialogDescription>
            Modify the details or photo of this menu item.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-menu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Item Photo</Label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                    <span className="text-white text-sm ml-2">Uploading...</span>
                  </div>
                )}
                {!uploadingImage && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-primary text-white rounded-md px-2 py-1 text-xs transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    >
                      <ImagePlus className="h-3 w-3" />
                      Change
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Click to upload a photo</span>
                <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Item Name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              {...register("description")}
              className="resize-none h-20"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₱)</Label>
              <Input id="edit-price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select defaultValue={item.category} onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Classic Burgers">Classic Burgers</SelectItem>
                  <SelectItem value="Specialty Burgers">Specialty Burgers</SelectItem>
                  <SelectItem value="Sides & Fries">Sides &amp; Fries</SelectItem>
                  <SelectItem value="Drinks">Drinks</SelectItem>
                  <SelectItem value="Combos">Combos</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="edit-menu-form"
            disabled={loading || uploadingImage}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : uploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading image...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

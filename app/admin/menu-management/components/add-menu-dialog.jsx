"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { menuItemSchema } from "@/lib/validations/menu"
import { createMenuItem } from "@/lib/actions/menu-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2, PlusCircle, UtensilsCrossed, ImagePlus, X } from "lucide-react"
import Image from "next/image"

export function AddMenuDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Classic Burgers",
      imageUrl: "",
      isAvailable: true,
    },
  })

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    // Upload to Cloudinary via secure API route
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        setImageUrl(data.url)
        setValue("imageUrl", data.url)
        toast.success("Image uploaded successfully")
      } else {
        toast.error(data.error || "Image upload failed")
        setImagePreview(null)
      }
    } catch {
      toast.error("Image upload failed")
      setImagePreview(null)
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
      const result = await createMenuItem({ ...data, imageUrl })
      if (result.success) {
        toast.success("Menu item added successfully")
        setOpen(false)
        reset()
        setImagePreview(null)
        setImageUrl("")
      } else {
        toast.error(result.error || "Failed to add item")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setImagePreview(null); setImageUrl("") } }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UtensilsCrossed className="h-5 w-5" />
            <DialogTitle>Add New Menu Item</DialogTitle>
          </div>
          <DialogDescription>
            Enter the details for the new menu item including a photo.
          </DialogDescription>
        </DialogHeader>

        <form id="add-menu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Classic Cheeseburger" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the item..."
              className="resize-none h-20"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₱)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} placeholder="99.00" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue="Classic Burgers" onValueChange={(val) => setValue("category", val)}>
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
            form="add-menu-form"
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
              "Add to Menu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

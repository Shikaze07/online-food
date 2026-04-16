"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconPlus, IconMinus, IconShoppingCart } from "@tabler/icons-react"
import { UtensilsCrossed } from "lucide-react"
import Image from "next/image"

export function MenuCard({ item }) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleIncrement = () => setQuantity((q) => q + 1)
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1))

  const handleAddToCart = () => {
    addToCart(item, quantity)
    setQuantity(1)
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-muted/60 bg-card/50 backdrop-blur-sm">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 font-semibold">
          {item.category}
        </Badge>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl line-clamp-1">{item.name}</CardTitle>
          <span className="text-xl font-bold text-primary">
            ₱{item.price.toFixed(2)}
          </span>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {item.description || "No description available."}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-center gap-4 mt-4 bg-muted/30 p-2 rounded-lg border border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-background"
            onClick={handleDecrement}
            disabled={quantity <= 1}
          >
            <IconMinus className="h-4 w-4" />
          </Button>
          <span className="font-bold w-4 text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-background"
            onClick={handleIncrement}
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-4 mt-2pt-0">
        <Button
          className="w-full gap-2 font-bold group-hover:scale-[1.02] transition-transform active:scale-95"
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
        >
          <IconShoppingCart className="h-4 w-4" />
          {item.isAvailable ? "Add to Cart" : "Sold Out"}
        </Button>
      </CardFooter>
    </Card>
  )
}

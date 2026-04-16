"use client"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconArrowRight,
  IconShoppingCartOff,
  IconChevronLeft,
} from "@tabler/icons-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function CartManagementPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-7 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="bg-muted p-8 rounded-full">
          <IconShoppingCartOff className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground text-lg">
            Looks like you haven't added any delicious items yet.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/customer/menu">
            <IconChevronLeft className="h-4 w-4" />
            Browse Our Menu
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-7 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">My Shopping Cart ({totalItems})</h2>
        <Button 
          variant="outline" 
          className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
          onClick={clearCart}
        >
          <IconTrash className="h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-muted/60 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-24 w-24 rounded-xl bg-muted shrink-0 flex items-center justify-center overflow-hidden border border-border relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-xs font-bold font-mono">{item.name[0]}</span>
                  )}
                </div>
                
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.category}</p>
                  <p className="text-primary font-bold">₱{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-lg border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <IconMinus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="text-right sm:w-20 font-bold text-lg">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  onClick={() => removeFromCart(item.id)}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Order Summary
              </h3>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₱{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm italic">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-primary">
                    ₱{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button asChild className="w-full h-12 text-lg font-bold gap-2 shadow-lg mt-6" size="lg">
                <Link href="/customer/online-ordering">
                  Proceed to Payout
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <p className="text-[10px] text-center text-muted-foreground px-4 uppercase tracking-widest leading-relaxed mt-4">
                Secure checkout • Fast Delivery • 100% Satisfaction
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

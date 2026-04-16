"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconShoppingCart } from "@tabler/icons-react"
import { useCart } from "@/context/cart-context"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const { totalItems } = useCart()
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {/* <h1 className="text-base font-bold tracking-tight text-primary">Food Ordering System</h1> */}
        </div>

        {!isAdmin && (
          <div className="flex items-center gap-4">
            <Link href="/customer/cart-management" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <IconShoppingCart className="h-6 w-6 text-foreground" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full border-2 border-background animate-in zoom-in"
                >
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

"use client"

import { useState, useEffect } from "react"
import { getMenuItems } from "@/lib/actions/menu-actions"
import { MenuCard } from "./components/menu-card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { IconSearch, IconListDetails } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const categories = [
  "All Items",
  "Classic Burgers",
  "Specialty Burgers",
  "Sides & Fries",
  "Drinks",
  "Combos",
]

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [activeCategory, setActiveCategory] = useState("All Items")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { menuItems: items, error } = await getMenuItems()
      if (items) {
        setMenuItems(items)
        setFilteredItems(items)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = menuItems

    if (activeCategory !== "All Items") {
      result = result.filter((item) => item.category === activeCategory)
    }

    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredItems(result)
  }, [activeCategory, searchQuery, menuItems])

  return (
    <div className="container mx-auto p-7 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <IconListDetails className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Our Menu</h2>
          </div>
          <p className="text-muted-foreground text-lg italic">
            Savory bites delivered straight to your doorstep.
          </p>
        </div>

        <div className="relative w-full md:w-[350px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search our delicious menu..."
            className="pl-10 h-11 bg-card shadow-sm border-muted/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Tabs
          defaultValue="All Items"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="bg-muted/40 p-1 h-12 w-full justify-start overflow-x-auto overflow-y-hidden custom-scrollbar border">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="px-4 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
            <div className="bg-muted p-4 rounded-full">
              <IconSearch className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No items found</h3>
              <p className="text-muted-foreground">
                We couldn't find any items matching your current filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

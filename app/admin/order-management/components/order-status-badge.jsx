"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
  },
  PREPARING: {
    label: "Preparing",
    icon: ChefHat,
    className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20"
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    icon: Truck,
    className: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20"
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20"
  }
}

export function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2.5 py-0.5 font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

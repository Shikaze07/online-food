"use client"

import { Badge } from "@/components/ui/badge"
import { 
  UserCheck, 
  Package, 
  Bike, 
  CheckCircle2 
} from "lucide-react"

const statusConfig = {
  ASSIGNED: {
    label: "Assigned",
    icon: UserCheck,
    className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20"
  },
  PICKED_UP: {
    label: "Picked Up",
    icon: Package,
    className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
  },
  ON_THE_WAY: {
    label: "On the Way",
    icon: Bike,
    className: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20"
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
  }
}

export function DeliveryStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.ASSIGNED
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

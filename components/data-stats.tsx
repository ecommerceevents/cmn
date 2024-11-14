"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Database, Activity } from "lucide-react"
import { useStats } from "@/lib/supabase/hooks/use-stats"
import { LoadingState } from "./loading-state"
import { formatDistanceToNow } from "date-fns"

export function DataStats() {
  const { stats, loading } = useStats()

  if (loading) {
    return <LoadingState message="Loading statistics..." className="min-h-[200px]" />
  }

  const stats_config = [
    {
      title: "Total Companies",
      value: stats.companies.toLocaleString(),
      description: stats.lastSync 
        ? `Last sync: ${formatDistanceToNow(new Date(stats.lastSync), { addSuffix: true })}` 
        : 'Not synced yet',
      icon: Building2,
    },
    {
      title: "Total Contacts",
      value: stats.contacts.toLocaleString(),
      description: "Verified contacts",
      icon: Users,
    },
    {
      title: "Data Points",
      value: stats.dataPoints.toLocaleString(),
      description: "Unique data points collected",
      icon: Database,
    },
    {
      title: "API Calls",
      value: stats.apiCalls.toLocaleString(),
      description: "API calls this month",
      icon: Activity,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {stats_config.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
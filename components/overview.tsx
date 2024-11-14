"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { supabase } from "@/lib/supabase/client"
import { LoadingState } from "./loading-state"
import { EmptyState } from "./empty-state"
import { Database } from "lucide-react"

interface MonthlyStats {
  name: string
  Companies: number
  Contacts: number
}

export function Overview() {
  const [data, setData] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          return {
            name: date.toLocaleString('default', { month: 'short' }),
            startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
            endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
          }
        }).reverse()

        const monthlyStats = await Promise.all(
          months.map(async (month) => {
            const { count: companiesCount } = await supabase
              .from('companies')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', month.startDate)
              .lt('created_at', month.endDate)

            const { count: contactsCount } = await supabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', month.startDate)
              .lt('created_at', month.endDate)

            return {
              name: month.name,
              Companies: companiesCount || 0,
              Contacts: contactsCount || 0
            }
          })
        )

        setData(monthlyStats)
      } catch (err) {
        console.error('Error fetching monthly stats:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch statistics'))
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyStats()
  }, [])

  if (loading) {
    return <LoadingState message="Loading statistics..." className="h-[350px]" />
  }

  if (error || data.every(month => month.Companies === 0 && month.Contacts === 0)) {
    return (
      <EmptyState
        icon={Database}
        title="No Data Available"
        description="Start by adding companies and contacts to see statistics."
        className="h-[350px]"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar
          dataKey="Companies"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="Contacts"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, User, Database } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { LoadingState } from "./loading-state"
import { EmptyState } from "./empty-state"

interface Activity {
  id: string
  type: 'company' | 'contact' | 'sync'
  description: string
  entity: string
  created_at: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5)

        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, company:companies(name), updated_at')
          .order('updated_at', { ascending: false })
          .limit(5)

        const mappedActivities: Activity[] = [
          ...(companies?.map(company => ({
            id: `company-${company.id}`,
            type: 'company' as const,
            description: 'Company profile enriched',
            entity: company.name,
            created_at: company.updated_at
          })) || []),
          ...(contacts?.map(contact => ({
            id: `contact-${contact.id}`,
            type: 'contact' as const,
            description: 'Contact information updated',
            entity: `${contact.first_name} ${contact.last_name}${contact.company?.name ? ` at ${contact.company.name}` : ''}`,
            created_at: contact.updated_at
          })) || [])
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5)

        setActivities(mappedActivities)
      } catch (error) {
        console.error('Error fetching activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return <LoadingState message="Loading recent activity..." />
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No Recent Activity"
        description="Activity will appear here as data is enriched and updated."
      />
    )
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg p-3 transition-all hover:bg-accent"
          >
            {activity.type === 'company' && (
              <Building2 className="mt-1 h-5 w-5 text-primary" />
            )}
            {activity.type === 'contact' && (
              <User className="mt-1 h-5 w-5 text-primary" />
            )}
            {activity.type === 'sync' && (
              <Database className="mt-1 h-5 w-5 text-primary" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.entity}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../client'

interface Stats {
  companies: number
  contacts: number
  dataPoints: number
  apiCalls: number
  lastSync: string | null
}

const DEFAULT_STATS: Stats = {
  companies: 0,
  contacts: 0,
  dataPoints: 0,
  apiCalls: 0,
  lastSync: null
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchStats = async () => {
      try {
        const [companiesResult, contactsResult, syncResult] = await Promise.all([
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }),
          supabase.from('companies')
            .select('last_enrichment_date')
            .not('last_enrichment_date', 'is', null)
            .order('last_enrichment_date', { ascending: false })
            .limit(1)
            .single()
        ])

        if (!mounted) return

        const companiesCount = companiesResult.count ?? 0
        const contactsCount = contactsResult.count ?? 0

        setStats({
          companies: companiesCount,
          contacts: contactsCount,
          dataPoints: (companiesCount * 10) + (contactsCount * 5),
          apiCalls: 0,
          lastSync: syncResult.data?.last_enrichment_date || null
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch statistics'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    // Set up real-time subscription
    const subscription = supabase
      .channel('stats_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'companies'
      }, fetchStats)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'contacts'
      }, fetchStats)
      .subscribe()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { stats, loading, error }
}
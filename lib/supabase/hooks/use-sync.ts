"use client"

import { useState, useCallback } from 'react'
import { supabase } from '../client'
import { useToast } from '@/hooks/use-toast'

export function useSync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const sync = useCallback(async () => {
    if (syncing) return
    
    setSyncing(true)
    setError(null)

    try {
      // Get companies to sync
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100)

      if (companiesError) throw companiesError

      if (!companies || companies.length === 0) {
        toast({
          title: "No Data to Sync",
          description: "Add companies to start syncing data."
        })
        return
      }

      // Update last sync timestamp
      const now = new Date()
      await supabase
        .from('companies')
        .update({ last_enrichment_date: now.toISOString() })
        .in('id', companies.map(c => c.id))

      setLastSynced(now)
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${companies.length} companies.`
      })
    } catch (err) {
      console.error('Sync error:', err)
      setError(err instanceof Error ? err : new Error('Failed to sync'))
      toast({
        title: "Sync Failed",
        description: err instanceof Error ? err.message : "Failed to sync data.",
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }, [toast])

  return {
    sync,
    syncing,
    lastSynced,
    error
  }
}
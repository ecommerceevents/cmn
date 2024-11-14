"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../client'
import type { Database } from '../database.types'

type ApiKey = Database['public']['Tables']['api_keys']['Row']

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('api_keys')
          .select('*')
          .order('service')

        if (fetchError) throw fetchError
        setApiKeys(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching API keys:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch API keys'))
        setApiKeys([])
      } finally {
        setLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  const updateApiKey = async (service: string, config: string | Record<string, any>) => {
    try {
      const apiKey = typeof config === 'string' ? config : JSON.stringify(config)
      
      const { data, error: upsertError } = await supabase
        .from('api_keys')
        .upsert({
          service,
          api_key: apiKey,
          is_active: true,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'service'
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      setApiKeys(prev => {
        const index = prev.findIndex(k => k.service === service)
        if (index >= 0) {
          return [...prev.slice(0, index), data, ...prev.slice(index + 1)]
        }
        return [...prev, data]
      })

      return data
    } catch (err) {
      console.error('Error updating API key:', err)
      throw err instanceof Error ? err : new Error('Failed to update API key')
    }
  }

  return {
    apiKeys,
    loading,
    error,
    updateApiKey
  }
}
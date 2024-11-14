"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../client'
import type { Database } from '../database.types'

type Keyword = Database['public']['Tables']['keywords']['Row']

export function useKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('keywords')
          .select('*')
          .order('priority', { ascending: false })
          .order('keyword')

        if (fetchError) throw fetchError
        setKeywords(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load keywords'))
      } finally {
        setLoading(false)
      }
    }

    fetchKeywords()

    // Set up real-time subscription
    const subscription = supabase
      .channel('keywords_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'keywords'
      }, fetchKeywords)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addKeyword = async (keyword: string, category?: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('keywords')
        .insert([{
          keyword,
          category,
          is_active: true,
          priority: 0
        }])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add keyword')
    }
  }

  const removeKeyword = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('keywords')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to remove keyword')
    }
  }

  return {
    keywords,
    loading,
    error,
    addKeyword,
    removeKeyword
  }
}
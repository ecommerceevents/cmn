"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../client'
import type { Database } from '../database.types'

type Company = Database['public']['Tables']['companies']['Row']

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name')

        if (error) throw error
        setCompanies(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const addCompany = async (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single()

      if (error) throw error
      setCompanies(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCompanies(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCompanies(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  return {
    companies,
    loading,
    error,
    addCompany,
    updateCompany,
    deleteCompany
  }
}
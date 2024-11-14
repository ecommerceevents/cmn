import { useEffect, useState } from 'react'
import { supabase } from './client'
import type { Database } from './database.types'

export function useCompanies() {
  const [companies, setCompanies] = useState<Database['public']['Tables']['companies']['Row'][]>([])
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
        setCompanies(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return { companies, loading, error }
}

export function useContacts(companyId?: string) {
  const [contacts, setContacts] = useState<Database['public']['Tables']['contacts']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const query = supabase
          .from('contacts')
          .select('*')
          .order('last_name')

        if (companyId) {
          query.eq('company_id', companyId)
        }

        const { data, error } = await query

        if (error) throw error
        setContacts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [companyId])

  return { contacts, loading, error }
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<Database['public']['Tables']['api_keys']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('service')

        if (error) throw error
        setApiKeys(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  return { apiKeys, loading, error }
}
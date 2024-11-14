"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../client'
import type { Database } from '../database.types'

type Contact = Database['public']['Tables']['contacts']['Row']

export function useContacts(companyId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        let query = supabase
          .from('contacts')
          .select('*')
          .order('last_name')

        if (companyId) {
          query = query.eq('company_id', companyId)
        }

        const { data, error } = await query
        if (error) throw error
        setContacts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [companyId])

  const addContact = async (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single()

      if (error) throw error
      setContacts(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setContacts(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred')
    }
  }

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact
  }
}
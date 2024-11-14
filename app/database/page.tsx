"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Database, Download, Key } from "lucide-react"
import { useSync } from "@/lib/supabase/hooks/use-sync"
import { useApiKeys } from "@/lib/supabase/hooks/use-api-keys"
import { formatDistanceToNow } from "date-fns"
import { LoadingState } from "@/components/loading-state"
import { EmptyState } from "@/components/empty-state"

export default function DatabasePage() {
  const { toast } = useToast()
  const { sync, syncing, lastSynced, error: syncError } = useSync()
  const { apiKeys, loading, updateApiKey } = useApiKeys()
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [showKeys, setShowKeys] = useState({
    supabase: false
  })

  const handleSync = async () => {
    try {
      await sync()
      toast({
        title: "Sync Started",
        description: "Data synchronization has been initiated."
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: "Sync Failed",
        description: "There was an error synchronizing the data.",
        variant: "destructive"
      })
    }
  }

  const handleSaveSupabaseConfig = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter both Supabase URL and API key",
        variant: "destructive"
      })
      return
    }

    try {
      await updateApiKey('supabase', {
        url: supabaseUrl.trim(),
        key: supabaseKey.trim()
      })
      
      setSupabaseUrl("")
      setSupabaseKey("")
      
      toast({
        title: "Success",
        description: "Supabase configuration has been saved."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Supabase configuration.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full p-8">
        <LoadingState message="Loading database settings..." />
      </div>
    )
  }

  const hasSupabaseConfig = apiKeys?.some(k => k.service === 'supabase' && k.is_active)

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Database</h2>
        <p className="text-muted-foreground">
          Configure target Supabase database for synchronization
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Supabase Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.supabase ? "text" : "password"}
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="Enter Target Supabase URL"
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.supabase ? "text" : "password"}
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="Enter Target Supabase Service Role Key"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowKeys(prev => ({ ...prev, supabase: !prev.supabase }))}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSaveSupabaseConfig}>
                  Save Configuration
                </Button>
              </div>
            </div>
            {hasSupabaseConfig && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Target Supabase is configured and active
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Data Synchronization</h3>
              <p className="text-sm text-muted-foreground">
                {lastSynced 
                  ? `Last synced: ${formatDistanceToNow(lastSynced, { addSuffix: true })}` 
                  : 'Not synced yet'}
              </p>
              {syncError && (
                <p className="text-sm text-destructive">
                  Error: {syncError.message}
                </p>
              )}
              {!hasSupabaseConfig && (
                <p className="text-sm text-amber-500">
                  Configure target Supabase to enable syncing
                </p>
              )}
            </div>
            <Button 
              onClick={handleSync}
              disabled={syncing || !hasSupabaseConfig}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download your data in different formats
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Button variant="outline" disabled={!hasSupabaseConfig}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button variant="outline" disabled={!hasSupabaseConfig}>
              <Download className="mr-2 h-4 w-4" />
              Export to Google Sheets
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
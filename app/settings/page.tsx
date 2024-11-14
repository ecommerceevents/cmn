"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApiKeys } from "@/lib/supabase/hooks/use-api-keys"
import { LoadingState } from "@/components/loading-state"
import { EmptyState } from "@/components/empty-state"

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState({
    scrapin: false,
    apollo: false,
    builtwith: false
  })
  const { toast } = useToast()
  const { apiKeys, loading, error, updateApiKey } = useApiKeys()

  const [keys, setKeys] = useState({
    scrapin: '',
    apollo: '',
    builtwith: ''
  })

  const handleSaveKey = async (service: keyof typeof keys) => {
    if (!keys[service].trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive"
      })
      return
    }

    try {
      await updateApiKey(service, keys[service].trim())
      setKeys(prev => ({ ...prev, [service]: '' }))
      toast({
        title: "Success",
        description: `${service.charAt(0).toUpperCase() + service.slice(1)} API key has been saved.`
      })
    } catch (error) {
      console.error('Error saving API key:', error)
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleShowKey = (service: keyof typeof showKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }))
  }

  if (loading) {
    return (
      <div className="h-full p-8">
        <LoadingState message="Loading API settings..." />
      </div>
    )
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">API Settings</h2>
        <p className="text-muted-foreground">
          Manage your API keys and integration settings
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">SCRAPIN.io API</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Input
                  type={showKeys.scrapin ? "text" : "password"}
                  value={keys.scrapin}
                  onChange={(e) => setKeys(prev => ({ ...prev, scrapin: e.target.value }))}
                  placeholder="Enter SCRAPIN.io API key"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => toggleShowKey("scrapin")}
                >
                  {showKeys.scrapin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={() => handleSaveKey("scrapin")}>
                <Key className="mr-2 h-4 w-4" />
                Save Key
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Used for LinkedIn profile and company data enrichment
            </p>
            {apiKeys?.find(k => k.service === 'scrapin') && (
              <p className="text-sm text-green-600 dark:text-green-400">
                API key is configured and active
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Apollo.io API</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Input
                  type={showKeys.apollo ? "text" : "password"}
                  value={keys.apollo}
                  onChange={(e) => setKeys(prev => ({ ...prev, apollo: e.target.value }))}
                  placeholder="Enter Apollo.io API key"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => toggleShowKey("apollo")}
                >
                  {showKeys.apollo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={() => handleSaveKey("apollo")}>
                <Key className="mr-2 h-4 w-4" />
                Save Key
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Used for contact and company information enrichment
            </p>
            {apiKeys?.find(k => k.service === 'apollo') && (
              <p className="text-sm text-green-600 dark:text-green-400">
                API key is configured and active
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">BuiltWith API</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Input
                  type={showKeys.builtwith ? "text" : "password"}
                  value={keys.builtwith}
                  onChange={(e) => setKeys(prev => ({ ...prev, builtwith: e.target.value }))}
                  placeholder="Enter BuiltWith API key"
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => toggleShowKey("builtwith")}
                >
                  {showKeys.builtwith ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={() => handleSaveKey("builtwith")}>
                <Key className="mr-2 h-4 w-4" />
                Save Key
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Used for technology stack analysis
            </p>
            {apiKeys?.find(k => k.service === 'builtwith') && (
              <p className="text-sm text-green-600 dark:text-green-400">
                API key is configured and active
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
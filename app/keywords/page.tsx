"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useKeywords } from "@/lib/supabase/hooks/use-keywords"
import { LoadingState } from "@/components/loading-state"
import { EmptyState } from "@/components/empty-state"

export default function KeywordsPage() {
  const [newKeyword, setNewKeyword] = useState("")
  const { toast } = useToast()
  const { keywords = [], loading, addKeyword, removeKeyword } = useKeywords()

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return
    
    try {
      await addKeyword(newKeyword.trim())
      setNewKeyword("")
      toast({
        title: "Keyword added",
        description: `"${newKeyword.trim()}" has been added to your keywords.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add keyword. It might already exist.",
        variant: "destructive"
      })
    }
  }

  const handleRemoveKeyword = async (id: string, keyword: string) => {
    try {
      await removeKeyword(id)
      toast({
        title: "Keyword removed",
        description: `"${keyword}" has been removed from your keywords.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove keyword.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full p-8">
        <LoadingState message="Loading keywords..." />
      </div>
    )
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Keywords</h2>
        <p className="text-muted-foreground">
          Manage your search keywords and filters
        </p>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Add new keyword..." 
            className="max-w-sm"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
          />
          <Button onClick={handleAddKeyword}>
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Active Keywords</h3>
          {keywords.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Keywords Added"
              description="Add your first keyword to start tracking."
            />
          ) : (
            <div className="space-y-2">
              {keywords.map((keyword) => (
                <div 
                  key={keyword.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{keyword.keyword}</span>
                    {keyword.category && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({keyword.category})
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveKeyword(keyword.id, keyword.keyword)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
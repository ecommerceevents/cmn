"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      toast({
        title: "Files received",
        description: `Uploading ${files.length} file(s)...`
      })
    }
  }, [toast])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.csv,.xlsx,.xls'
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        toast({
          title: "Files selected",
          description: `Uploading ${files.length} file(s)...`
        })
      }
    }
    input.click()
  }, [toast])

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Data Upload</h2>
        <p className="text-muted-foreground">
          Upload your data files for enrichment
        </p>
      </div>
      
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div 
            className={`p-8 border-2 border-dashed rounded-lg text-center w-full transition-colors
              ${isDragging ? "border-primary bg-primary/10" : "border-border"}
              ${isDragging ? "cursor-copy" : "cursor-pointer"}`}
            onDragEnter={(e) => { handleDrag(e); setIsDragging(true) }}
            onDragLeave={(e) => { handleDrag(e); setIsDragging(false) }}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Upload className={`mx-auto h-12 w-12 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            <h3 className="mt-4 text-lg font-semibold">Drop your files here</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Support for CSV, Excel, and Google Sheets files
            </p>
            <Button className="mt-4" onClick={(e) => { e.stopPropagation(); handleFileSelect(); }}>
              <FileUp className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
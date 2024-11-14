import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
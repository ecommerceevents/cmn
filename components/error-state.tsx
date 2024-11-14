import { AlertCircle } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = "Error",
  message = "Something went wrong. Please try again later.",
  retry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {retry && (
        <Button
          onClick={retry}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
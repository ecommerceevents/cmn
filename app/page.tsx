import { Card } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"
import { DataStats } from "@/components/data-stats"

export default function Home() {
  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your data enrichment platform dashboard
        </p>
      </div>
      <DataStats />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Data Enrichment Overview</h3>
            <Overview />
          </div>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <RecentActivity />
          </div>
        </Card>
      </div>
    </div>
  )
}
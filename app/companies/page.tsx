"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Search, MapPin, Users, Calendar } from "lucide-react"
import { useCompanies } from "@/lib/supabase/hooks"
import { formatMoney } from "@/lib/utils"
import { LoadingState } from "@/components/loading-state"
import { EmptyState } from "@/components/empty-state"

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { companies, loading } = useCompanies()

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.headquarters_city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-full p-8">
        <LoadingState message="Loading companies..." />
      </div>
    )
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
        <p className="text-muted-foreground">
          View and manage enriched company profiles
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Input 
          placeholder="Search companies..." 
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
      
      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="Start by adding your first company or importing data."
          action={{
            label: "Add Company",
            onClick: () => {/* TODO: Implement add company */}
          }}
        />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Results Found"
          description="Try adjusting your search terms."
        />
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="p-6">
              <div className="flex items-start space-x-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.industry || "Industry not specified"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Employees: {company.employee_count_min && company.employee_count_max ? 
                        `${company.employee_count_min.toLocaleString()}-${company.employee_count_max.toLocaleString()}` : 
                        'Not specified'}
                    </div>
                    {(company.headquarters_city || company.headquarters_state) && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        Location: {[company.headquarters_city, company.headquarters_state]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        Founded: {company.founded_year}
                      </div>
                    )}
                    {(company.annual_revenue_min || company.annual_revenue_max) && (
                      <div className="flex items-center text-sm">
                        <span className="mr-2">💰</span>
                        Revenue: {company.annual_revenue_min && company.annual_revenue_max ? 
                          `${formatMoney(company.annual_revenue_min)}-${formatMoney(company.annual_revenue_max)}` : 
                          'Not specified'}
                      </div>
                    )}
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
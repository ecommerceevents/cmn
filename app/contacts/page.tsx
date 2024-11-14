"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Search, Mail, Phone } from "lucide-react"
import { useContacts } from "@/lib/supabase/hooks"
import { LoadingState } from "@/components/loading-state"
import { EmptyState } from "@/components/empty-state"

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { contacts, loading } = useContacts()

  const filteredContacts = contacts.filter(contact => 
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-full p-8">
        <LoadingState message="Loading contacts..." />
      </div>
    )
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
        <p className="text-muted-foreground">
          View and manage enriched contact profiles
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Input 
          placeholder="Search contacts..." 
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
      
      {contacts.length === 0 ? (
        <EmptyState
          icon={User}
          title="No Contacts Found"
          description="Start by adding contacts or importing data from your sources."
          action={{
            label: "Import Contacts",
            onClick: () => window.location.href = "/upload"
          }}
        />
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Results Found"
          description="Try adjusting your search terms."
        />
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-6">
              <div className="flex items-start space-x-4">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                  <div className="mt-4 space-y-2">
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                  <Button className="mt-4" variant="outline" size="sm">
                    View Profile
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
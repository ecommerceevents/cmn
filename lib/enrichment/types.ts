export interface EnrichmentJob {
  id: string;
  entityType: 'company' | 'contact';
  entityId: string;
  service: 'apollo' | 'builtwith' | 'scrapin';
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastError?: string;
  scheduledFor: Date;
  lockedAt?: Date;
  lockedBy?: string;
}

export interface ApolloEnrichment {
  companyInfo: {
    name: string;
    website: string;
    industry: string;
    employeeCount: {
      min: number;
      max: number;
    };
    revenue: {
      min: number;
      max: number;
    };
    foundedYear: number;
    socialProfiles: {
      linkedin?: string;
      twitter?: string;
    };
    description: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
  };
  contacts: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
    department: string;
    linkedinUrl: string;
  }>;
}

export interface BuiltWithEnrichment {
  technologies: Array<{
    name: string;
    category: string;
    firstDetected: Date;
    lastDetected: Date;
  }>;
  hosting: {
    provider: string;
    details: Record<string, any>;
  };
  analytics: Array<{
    service: string;
    details: Record<string, any>;
  }>;
}

export interface ScrapinEnrichment {
  linkedinData: {
    companyInfo: {
      description: string;
      industry: string;
      employeeCount: number;
      headquarters: string;
      founded: number;
      specialties: string[];
    };
    recentPosts: Array<{
      date: Date;
      content: string;
      engagement: {
        likes: number;
        comments: number;
      };
    }>;
    jobPostings: Array<{
      title: string;
      location: string;
      postedDate: Date;
      description: string;
    }>;
  };
}
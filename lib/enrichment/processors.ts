import { createClient } from '@supabase/supabase-js';
import type { 
  EnrichmentJob, 
  ApolloEnrichment, 
  BuiltWithEnrichment, 
  ScrapinEnrichment 
} from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function processApolloEnrichment(job: EnrichmentJob) {
  try {
    // 1. Get API key
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service', 'apollo')
      .single();

    // 2. Get company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', job.entityId)
      .single();

    // 3. Call Apollo API
    const enrichedData: ApolloEnrichment = await fetchApolloData(
      apiKey.api_key,
      company.website
    );

    // 4. Update company data
    await supabase
      .from('companies')
      .update({
        name: enrichedData.companyInfo.name,
        industry: enrichedData.companyInfo.industry,
        employee_count_min: enrichedData.companyInfo.employeeCount.min,
        employee_count_max: enrichedData.companyInfo.employeeCount.max,
        annual_revenue_min: enrichedData.companyInfo.revenue.min,
        annual_revenue_max: enrichedData.companyInfo.revenue.max,
        founded_year: enrichedData.companyInfo.foundedYear,
        linkedin_url: enrichedData.companyInfo.socialProfiles.linkedin,
        twitter_url: enrichedData.companyInfo.socialProfiles.twitter,
        description: enrichedData.companyInfo.description,
        headquarters_city: enrichedData.companyInfo.location.city,
        headquarters_state: enrichedData.companyInfo.location.state,
        headquarters_country: enrichedData.companyInfo.location.country,
        last_enrichment_date: new Date().toISOString()
      })
      .eq('id', job.entityId);

    // 5. Insert new contacts
    for (const contact of enrichedData.contacts) {
      await supabase
        .from('contacts')
        .upsert({
          company_id: job.entityId,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          department: contact.department,
          linkedin_url: contact.linkedinUrl,
          is_verified: true,
          verification_date: new Date().toISOString(),
          verification_method: 'apollo'
        }, {
          onConflict: 'email'
        });
    }

    // 6. Update job status
    await supabase
      .from('enrichment_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

  } catch (error) {
    await supabase
      .from('enrichment_queue')
      .update({
        status: 'failed',
        last_error: error.message,
        retry_count: job.retryCount + 1
      })
      .eq('id', job.id);
  }
}

export async function processBuiltWithEnrichment(job: EnrichmentJob) {
  try {
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service', 'builtwith')
      .single();

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', job.entityId)
      .single();

    const enrichedData: BuiltWithEnrichment = await fetchBuiltWithData(
      apiKey.api_key,
      company.website
    );

    await supabase
      .from('companies')
      .update({
        tech_stack: enrichedData.technologies,
        last_enrichment_date: new Date().toISOString()
      })
      .eq('id', job.entityId);

    await supabase
      .from('enrichment_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

  } catch (error) {
    await supabase
      .from('enrichment_queue')
      .update({
        status: 'failed',
        last_error: error.message,
        retry_count: job.retryCount + 1
      })
      .eq('id', job.id);
  }
}

export async function processScrapinEnrichment(job: EnrichmentJob) {
  try {
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service', 'scrapin')
      .single();

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', job.entityId)
      .single();

    const enrichedData: ScrapinEnrichment = await fetchScrapinData(
      apiKey.api_key,
      company.linkedin_url
    );

    await supabase
      .from('companies')
      .update({
        description: enrichedData.linkedinData.companyInfo.description,
        industry: enrichedData.linkedinData.companyInfo.industry,
        employee_count_max: enrichedData.linkedinData.companyInfo.employeeCount,
        founded_year: enrichedData.linkedinData.companyInfo.founded,
        last_enrichment_date: new Date().toISOString()
      })
      .eq('id', job.entityId);

    await supabase
      .from('enrichment_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', job.id);

  } catch (error) {
    await supabase
      .from('enrichment_queue')
      .update({
        status: 'failed',
        last_error: error.message,
        retry_count: job.retryCount + 1
      })
      .eq('id', job.id);
  }
}
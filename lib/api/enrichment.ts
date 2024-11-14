import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function enrichCompanyData(companyId: string) {
  try {
    // Get API keys
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('*')
      .in('service', ['apollo', 'builtwith', 'scrapin']);

    // Get company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) throw new Error('Company not found');

    // Queue enrichment jobs
    const enrichmentJobs = apiKeys.map(key => ({
      entity_type: 'company',
      entity_id: companyId,
      service: key.service,
      priority: 1,
      status: 'pending',
      scheduled_for: new Date().toISOString()
    }));

    await supabase.from('enrichment_queue').insert(enrichmentJobs);

    return { success: true };
  } catch (error) {
    console.error('Error enriching company data:', error);
    return { success: false, error };
  }
}

export async function processEnrichmentQueue() {
  try {
    // Get next pending job
    const { data: job } = await supabase
      .from('enrichment_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(1)
      .single();

    if (!job) return { success: true, message: 'No pending jobs' };

    // Lock the job
    await supabase
      .from('enrichment_queue')
      .update({
        status: 'processing',
        locked_at: new Date().toISOString(),
        locked_by: 'worker-1'
      })
      .eq('id', job.id);

    // Process based on service
    switch (job.service) {
      case 'apollo':
        await processApolloEnrichment(job);
        break;
      case 'builtwith':
        await processBuiltWithEnrichment(job);
        break;
      case 'scrapin':
        await processScrapinEnrichment(job);
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing enrichment queue:', error);
    return { success: false, error };
  }
}

async function processApolloEnrichment(job: any) {
  // Implementation will use Apollo API
  console.log('Processing Apollo enrichment:', job);
}

async function processBuiltWithEnrichment(job: any) {
  // Implementation will use BuiltWith API
  console.log('Processing BuiltWith enrichment:', job);
}

async function processScrapinEnrichment(job: any) {
  // Implementation will use Scrapin API
  console.log('Processing Scrapin enrichment:', job);
}
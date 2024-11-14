import { NextResponse } from 'next/server';
import { processEnrichmentQueue } from '@/lib/api/enrichment';

export async function POST() {
  try {
    const result = await processEnrichmentQueue();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
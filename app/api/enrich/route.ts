import { NextResponse } from 'next/server';
import { enrichCompanyData } from '@/lib/api/enrichment';

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const result = await enrichCompanyData(companyId);

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
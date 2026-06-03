import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSpreadsheet, fetchBusinesses } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    const records = await fetchBusinesses(spreadsheetId);
    
    // Sort records descending by date so newest registrations appear first by default
    records.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error: any) {
    console.error('Error fetching businesses from Google Sheets:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}

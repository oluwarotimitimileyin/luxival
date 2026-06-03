import { NextResponse } from 'next/server';
import { fetchNewlyRegisteredLLCs } from '../../services/prhClient';
import { appendCompaniesToGoogleSheet } from '../../services/googleSheets';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const limitedCompanies = await fetchNewlyRegisteredLLCs(selectedDate);
    const outcome = await appendCompaniesToGoogleSheet(limitedCompanies);
    
    return NextResponse.json({ success: outcome.success, rowsAppended: outcome.appendedCount });
  } catch (err) {
    return NextResponse.json({ success: false, rowsAppended: 0 });
  }
}

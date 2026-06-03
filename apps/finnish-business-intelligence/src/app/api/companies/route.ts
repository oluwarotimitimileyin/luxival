import { NextResponse } from 'next/server';
import { fetchNewlyRegisteredLLCs } from '../../services/prhClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  try {
    const limitedCompanies = await fetchNewlyRegisteredLLCs(selectedDate);
    return NextResponse.json({
      success: true,
      dateQueried: selectedDate,
      count: limitedCompanies.length,
      data: limitedCompanies
    });
  } catch (err) {
    return NextResponse.json({ success: false, count: 0, data: [] });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { harvestBusinessesForDate } from '@/lib/harvester';
import { getOrCreateSpreadsheet, appendBusinesses } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization Gate
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    
    // Check Authorization header or query token
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : queryToken;

    if (cronSecret && token !== cronSecret) {
      console.warn('Unauthorized cron request attempt.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Determine target registration date (Finland Timezone)
    const dateParam = url.searchParams.get('date');
    let targetDate = '';

    if (dateParam) {
      // Validate date parameter format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateParam)) {
        return NextResponse.json({ error: 'Invalid date parameter format. Use YYYY-MM-DD.' }, { status: 400 });
      }
      targetDate = dateParam;
    } else {
      // Get current date in Finland timezone (Europe/Helsinki)
      const finlandTimeStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' });
      const finlandDate = new Date(finlandTimeStr);
      const yyyy = finlandDate.getFullYear();
      const mm = String(finlandDate.getMonth() + 1).padStart(2, '0');
      const dd = String(finlandDate.getDate()).padStart(2, '0');
      targetDate = `${yyyy}-${mm}-${dd}`;
    }

    console.log(`Cron execution triggered for date: ${targetDate}`);

    // 3. Run the harvest routine
    const records = await harvestBusinessesForDate(targetDate);
    
    // 4. Update Google Sheets
    let spreadsheetId = '';
    let appendedCount = 0;

    if (records.length > 0) {
      spreadsheetId = await getOrCreateSpreadsheet();
      appendedCount = await appendBusinesses(spreadsheetId, records);
    } else {
      console.log(`No businesses found registered on ${targetDate}. Nothing to write.`);
    }

    return NextResponse.json({
      success: true,
      date: targetDate,
      harvestedCount: records.length,
      appendedCount,
      spreadsheetId
    });
  } catch (error: any) {
    console.error('Cron harvest routine encountered an error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}

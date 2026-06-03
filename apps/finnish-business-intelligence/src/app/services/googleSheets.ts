import { google } from 'googleapis';

export async function appendCompaniesToGoogleSheet(companies: any[]): Promise<{ success: boolean; appendedCount: number }> {
  if (!companies || companies.length === 0) return { success: true, appendedCount: 0 };
  
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1EKUcrjv_8UhWNbe3uLqPbJLxHMZoo_6Jw4_bcYoVfM4';

  if (!clientEmail || !rawPrivateKey) {
    console.warn('Sheets parameters missing in environment setups.');
    return { success: false, appendedCount: 0 };
  }

  try {
    const jwtClient = new google.auth.JWT(
      clientEmail,
      undefined,
      rawPrivateKey.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const values = companies.map(c => [c.name, c.idCode, c.city, c.type, c.date, 'Hub Automated Sync', new Date().toISOString()]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    });

    return { success: true, appendedCount: values.length };
  } catch (error) {
    console.error('Sheets Engine Error:', error);
    return { success: false, appendedCount: 0 };
  }
}

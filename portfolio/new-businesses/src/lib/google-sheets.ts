import { google } from 'googleapis';

// Interface for business records
export interface BusinessRecord {
  businessId: string;
  name: string;
  type: 'Osakeyhtiö (Oy)' | 'Yksityinen elinkeinonharjoittaja (Toiminimi)';
  city: string;
  date: string; // YYYY-MM-DD
  linkedInUrl: string;
  domainUrl: string;
}

// Get the Google Auth client
function getGoogleAuth() {
  let serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is missing.');
  }

  // Handle base64 encoded credential string
  serviceAccountJson = serviceAccountJson.trim();
  if (!serviceAccountJson.startsWith('{')) {
    serviceAccountJson = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } catch (error: any) {
    throw new Error(`Failed to parse Google credentials JSON: ${error.message}`);
  }
}

// Locate the "NewBusinesses" sheet ID, or create it if missing
export async function getOrCreateSpreadsheet(): Promise<string> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('Searching for spreadsheet "NewBusinesses" in Google Drive...');
    const searchResponse = await drive.files.list({
      q: "name = 'NewBusinesses' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = searchResponse.data.files || [];
    if (files.length > 0 && files[0].id) {
      console.log(`Found existing spreadsheet with ID: ${files[0].id}`);
      return files[0].id;
    }

    // Create the spreadsheet if not found
    console.log('Spreadsheet not found. Creating a new spreadsheet named "NewBusinesses"...');
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'NewBusinesses',
        },
      },
      fields: 'spreadsheetId',
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Failed to retrieve spreadsheetId after creation.');
    }

    console.log(`Created spreadsheet successfully with ID: ${spreadsheetId}`);

    // Add headers immediately
    const headers = [
      'Business ID',
      'Company Name',
      'Company Type',
      'Domicile / City',
      'Registration Date',
      'LinkedIn Finder',
      'Domain Discovery',
      'Added At'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    console.log('Added table header row to Sheet1.');
    return spreadsheetId;
  } catch (error: any) {
    console.error('Error in getOrCreateSpreadsheet:', error);
    throw error;
  }
}

// Append businesses to the sheet, filtering out existing businessIds to avoid duplicates
export async function appendBusinesses(spreadsheetId: string, records: BusinessRecord[]): Promise<number> {
  if (records.length === 0) return 0;
  
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // 1. Fetch existing Business IDs in Column A (Business ID)
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:A',
    });

    const rows = readResponse.data.values || [];
    // Convert A column to a Set of IDs (skip header row)
    const existingIds = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        existingIds.add(rows[i][0].trim());
      }
    }

    // 2. Filter out duplicates from input records
    const newRecords = records.filter(r => !existingIds.has(r.businessId.trim()));
    if (newRecords.length === 0) {
      console.log('All harvested records are already present in the sheet. No rows appended.');
      return 0;
    }

    console.log(`Appending ${newRecords.length} new records (out of ${records.length} total) to Google Sheet...`);

    // 3. Prepare rows
    const now = new Date().toISOString();
    const rowsToAppend = newRecords.map(r => [
      r.businessId,
      r.name,
      r.type,
      r.city,
      r.date,
      r.linkedInUrl,
      r.domainUrl,
      now
    ]);

    // 4. Append rows
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rowsToAppend,
      },
    });

    console.log(`Successfully appended ${newRecords.length} rows.`);
    return newRecords.length;
  } catch (error: any) {
    console.error('Error in appendBusinesses:', error);
    throw error;
  }
}

// Fetch all businesses from the sheet
export async function fetchBusinesses(spreadsheetId: string): Promise<BusinessRecord[]> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:H', // Skip header row
    });

    const rows = response.data.values || [];
    return rows.map(row => ({
      businessId: row[0] || '',
      name: row[1] || '',
      type: (row[2] || '') as any,
      city: row[3] || '',
      date: row[4] || '',
      linkedInUrl: row[5] || '',
      domainUrl: row[6] || '',
    }));
  } catch (error: any) {
    console.error('Error in fetchBusinesses:', error);
    throw error;
  }
}

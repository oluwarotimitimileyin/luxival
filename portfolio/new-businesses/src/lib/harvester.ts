import { chromium } from 'playwright';
import { BusinessRecord } from './google-sheets';

// Calculate LinkedIn Finder URL
function getLinkedInUrl(companyName: string): string {
  return `https://www.google.com/search?q=site:linkedin.com/in/+%22${encodeURIComponent(companyName)}%22+AND+(%22founder%22+OR+%22perustaja%22)`;
}

// Calculate Domain Discovery URL
function getDomainUrl(companyName: string): string {
  return `https://www.google.com/search?q=%22${encodeURIComponent(companyName)}%22+finland`;
}

// Helper to format date YYYY-MM-DD to DD.MM.YYYY
function formatDateToFinnish(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

// 1. Harvest limited companies (Oy) from PRH API v3
async function harvestLimitedCompanies(dateStr: string): Promise<BusinessRecord[]> {
  console.log(`Harvesting Limited Companies (Oy) from PRH API for date: ${dateStr}...`);
  const url = `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?registrationDateStart=${dateStr}&registrationDateEnd=${dateStr}&companyForm=OY`;

  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error(`PRH API response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    console.log(`PRH API returned ${results.length} companies.`);

    const records: BusinessRecord[] = results.map((company: any) => {
      const businessId = company.businessId?.value || '';
      
      // Get primary company name
      let name = '';
      if (company.names && company.names.length > 0) {
        const primaryName = company.names.find((n: any) => n.type === '1' || n.version === 1);
        name = primaryName ? primaryName.name : company.names[0].name;
      }

      // Extract city (domicile)
      let city = 'Tuntematon';
      if (company.addresses && company.addresses.length > 0) {
        // Search postOffices for Finnish city (languageCode '1')
        const address = company.addresses[0];
        if (address.postOffices && address.postOffices.length > 0) {
          const finnishOffice = address.postOffices.find((po: any) => po.languageCode === '1');
          if (finnishOffice && finnishOffice.city) {
            city = finnishOffice.city;
          } else if (address.postOffices[0].city) {
            city = address.postOffices[0].city;
          }
        }
      }

      // Capitalize city name nicely (e.g. "HELSINKI" -> "Helsinki")
      if (city) {
        city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      }

      return {
        businessId,
        name,
        type: 'Osakeyhtiö (Oy)' as const,
        city,
        date: dateStr,
        linkedInUrl: getLinkedInUrl(name),
        domainUrl: getDomainUrl(name)
      };
    }).filter((r: BusinessRecord) => r.businessId && r.name);

    return records;
  } catch (error) {
    console.error('Error in harvestLimitedCompanies:', error);
    return [];
  }
}

// 2. Scrape private traders from Virre Registered Notifications page
async function harvestPrivateTraders(dateStr: string): Promise<BusinessRecord[]> {
  const finnishDate = formatDateToFinnish(dateStr);
  console.log(`Harvesting Private Traders (Toiminimi) from Virre for date: ${finnishDate} (${dateStr})...`);

  let browser;
  try {
    // Launch headless chromium
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to Registered Notifications search page
    await page.goto('https://virre.prh.fi/novus/registeredNotifications', { waitUntil: 'networkidle' });

    // Fill start and end date
    await page.fill('#startDate', finnishDate);
    await page.fill('#endDate', finnishDate);

    // Select "Perustaminen" (kltu.U)
    await page.selectOption('#registrationTypeCode', 'kltu.U');

    // Uncheck "todayRegistered" if checked
    const isTodayChecked = await page.isChecked('#todayRegistered1');
    if (isTodayChecked) {
      await page.uncheck('#todayRegistered1');
    }

    // Submit search
    console.log('Submitting Virre search...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('#_eventId_search')
    ]);

    // Check if the results table exists
    const tableExists = await page.locator('#foundRegisteredNotifications').count() > 0;
    if (!tableExists) {
      console.log('No registered notifications table found for this date.');
      return [];
    }

    let allScrapedRows: any[] = [];
    let pageNum = 1;

    while (true) {
      console.log(`Parsing Virre results page ${pageNum}...`);
      const pageRows = await page.evaluate(() => {
        const table = document.getElementById('foundRegisteredNotifications');
        if (!table) return [];
        const tbody = table.querySelector('tbody');
        if (!tbody) return [];
        return Array.from(tbody.querySelectorAll('tr')).map(tr => {
          const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
          return {
            businessId: tds[0] || '',
            name: tds[1] || '',
            city: tds[2] || '',
            regType: tds[4] || '',
            details: tds[6] || ''
          };
        });
      });

      console.log(`Scraped ${pageRows.length} rows on page ${pageNum}.`);
      allScrapedRows.push(...pageRows);

      // Find and click Next button if not disabled
      const nextBtn = page.locator('.dataTables_paginate a:has-text("Seuraava Sivu"), .dataTables_paginate a.next');
      const count = await nextBtn.count();
      if (count === 0) {
        break;
      }

      const ariaDisabled = await nextBtn.getAttribute('aria-disabled');
      const classes = await nextBtn.getAttribute('class');
      if (ariaDisabled === 'true' || (classes && classes.includes('disabled'))) {
        console.log('Reached the last results page.');
        break;
      }

      console.log('Clicking Next page...');
      await nextBtn.click();
      await page.waitForTimeout(800); // Small delay for pagination load
      pageNum++;
      
      if (pageNum > 20) { // Safety break
        break;
      }
    }

    // Filter rows that are private traders (ELINKEINONHARJOITTAJA in details)
    const privateTraders = allScrapedRows.filter(row => row.details.includes('ELINKEINONHARJOITTAJA'));
    console.log(`Scraped ${allScrapedRows.length} entries. Filtered down to ${privateTraders.length} private traders.`);

    const records: BusinessRecord[] = privateTraders.map(pt => {
      // Domicile / City names are already in Titlecase from Virre
      const formattedCity = pt.city.charAt(0).toUpperCase() + pt.city.slice(1).toLowerCase();

      return {
        businessId: pt.businessId,
        name: pt.name,
        type: 'Yksityinen elinkeinonharjoittaja (Toiminimi)' as const,
        city: formattedCity,
        date: dateStr,
        linkedInUrl: getLinkedInUrl(pt.name),
        domainUrl: getDomainUrl(pt.name)
      };
    });

    return records;
  } catch (error) {
    console.error('Error in harvestPrivateTraders:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main harvesting function that joins Oys and private traders for a date
export async function harvestBusinessesForDate(dateStr: string): Promise<BusinessRecord[]> {
  console.log(`Starting background harvest routine for date: ${dateStr}`);
  
  // Run both queries simultaneously
  const [oys, privateTraders] = await Promise.all([
    harvestLimitedCompanies(dateStr),
    harvestPrivateTraders(dateStr)
  ]);

  const merged = [...oys, ...privateTraders];
  console.log(`Harvest complete for ${dateStr}. Merged ${merged.length} total new businesses (${oys.length} Oy, ${privateTraders.length} Toiminimi).`);

  // Simple deduplication based on business ID in the merged list
  const uniqueRecordsMap = new Map<string, BusinessRecord>();
  for (const r of merged) {
    if (r.businessId) {
      uniqueRecordsMap.set(r.businessId, r);
    }
  }

  const uniqueRecords = Array.from(uniqueRecordsMap.values());
  console.log(`Deduplicated merged records count: ${uniqueRecords.length}`);

  return uniqueRecords;
}

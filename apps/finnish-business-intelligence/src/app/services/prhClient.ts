export interface StreamlinedCompany {
  id: string;
  name: string;
  idCode: string;
  type: 'OY' | 'TMI';
  date: string;
  status: string;
  city: string;
}

export async function fetchNewlyRegisteredLLCs(targetDate?: string): Promise<StreamlinedCompany[]> {
  const queryDate = targetDate || new Date().toISOString().split('T')[0];
  const url = `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?registrationDateStart=${queryDate}&registrationDateEnd=${queryDate}&companyForm=OY&resultsPerPage=100`;
  
  try {
    const response = await fetch(url, { method: 'GET', next: { revalidate: 0 } });
    const json = await response.json();
    const resultsArray = json.results || [];
    
    return resultsArray.map((company: any, index: number) => ({
      id: `prh-llc-${company.businessId || index}`,
      name: (company.name || 'Unknown Entity').replace(/\s+/g, ' ').trim(),
      idCode: company.businessId || 'N/A',
      type: 'OY' as const,
      date: company.registrationDate || queryDate,
      status: 'Registered',
      city: company.domicile || 'Helsinki'
    }));
  } catch (error) {
    console.error('PRH API Engine Error:', error);
    return [];
  }
}

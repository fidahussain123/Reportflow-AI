const fs = require('fs');
const Papa = require('papaparse');

async function main() {
  console.log("Reading CSV...");
  const csvText = fs.readFileSync('Google_Ads_Sample.csv', 'utf8');
  
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const googleAdsData = parsed.data;
  
  console.log(`Parsed ${googleAdsData.length} rows. Sending to local API...`);
  
  try {
    const res = await fetch('http://localhost:3000/api/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: "Test Client",
        agencyName: "Test Agency",
        period: "Q3 2023",
        googleAdsData: googleAdsData,
        metaAdsData: null
      })
    });
    
    const status = res.status;
    const data = await res.json();
    console.log(`Status: ${status}`);
    if (status === 200) {
      console.log("SUCCESS! Report generated:");
      console.log(data.reportText.substring(0, 200) + '...\n[TRUNCATED]');
    } else {
      console.log(`Error Response:`, data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
main();

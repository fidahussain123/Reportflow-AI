fetch('http://localhost:3000/api/generate-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: "Acme Corp",
    agencyName: "Digital Pro",
    period: "Q3 2023",
    googleAdsData: [
      { campaign: "Search Brand", impressions: 5000, clicks: 500, cost: 250, conversions: 25 }
    ],
    metaAdsData: null
  })
})
.then(async res => {
  const status = res.status;
  const data = await res.json();
  console.log(`Status: ${status}`);
  console.log(`Response:`, data);
})
.catch(err => console.error('Fetch error:', err));

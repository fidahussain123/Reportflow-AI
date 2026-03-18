const fs = require('fs');
const Papa = require('papaparse');
const Anthropic = require('@anthropic-ai/sdk');

const envFile = fs.readFileSync('.env', 'utf8');
const keyMatch = envFile.match(/ANTHROPIC_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : null;

console.log("Using key from .env file:", apiKey.substring(0, 20) + "...");

const anthropic = new Anthropic({
  apiKey: apiKey,
});

async function main() {
  console.log("Reading CSV...");
  const csvText = fs.readFileSync('Google_Ads_Sample.csv', 'utf8');
  
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const googleAdsData = parsed.data;
  
  console.log(`Parsed ${googleAdsData.length} rows. Testing API...`);
  
  let formattedData = '=== GOOGLE ADS DATA ===\n\n';
  formattedData += googleAdsData.map((campaign, i) => {
    return `Campaign: ${campaign.Campaign || `Campaign ${i + 1}`}
  - Impressions: ${campaign.Impressions}
  - Clicks: ${campaign.Clicks}
  - CTR: ${campaign.CTR}
  - Avg. CPC: ${campaign['Avg. CPC']}
  - Cost: ${campaign.Cost}
  - Conversions: ${campaign.Conversions}
  - Conv. Rate: ${campaign['Conv. rate']}
  - Cost/Conv: ${campaign['Cost / conv.']}`;
  }).join('\n\n');

  const prompt = `You are an expert marketing analyst writing a professional client performance report.

Client: Test Client
Agency: Test Agency
Period: Q3 2023

CAMPAIGN DATA:
${formattedData}

Write a professional, narrative-style performance report with these exact sections:
## Executive Summary
## Campaign Performance
## Key Insights
## Recommendations
## Next Steps`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    console.log('\nSUCCESS! Report generated:\n');
    console.log(message.content[0].text.substring(0, 200) + '...\n[TRUNCATED]');
  } catch (e) {
    console.error('\nAPI Error:', e.status, e.name, e.message);
  }
}
main();

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log('claude-3-opus-20240229 works!');
  } catch (e) {
    console.error('API Error:', e.status, e.name, e.message);
  }
}
main();

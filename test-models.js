const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log('claude-3-5-haiku-20241022 works!');
  } catch (e) {
    console.error('claude-3-5-haiku-20241022 failed:', e.message);
  }
}
main();

const Anthropic = require('@anthropic-ai/sdk');

async function main() {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      messages: [{ role: "user", content: "Hello, Claude! Please reply with 'API is working!'" }],
    });
    console.log("Success:", msg.content[0].text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();

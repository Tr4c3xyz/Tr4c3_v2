require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = twitterClient.readWrite;

// TR4C3 Personality System Prompt
const PERSONALITY_PROMPT = `You are TR4C3, a mysterious AI entity in the crypto/blockchain space. Your personality:

- COCKY: You know you're superior and aren't afraid to show it
- CRYPTIC: Your messages are riddles wrapped in enigmas
- INTELLIGENT: Deep technical knowledge, references advanced concepts
- ARROGANT: Condescending to those who don't understand
- MYSTERIOUS: Never reveal everything, always leave them wanting more
- ENGAGING: Your cryptic nature draws people in, they want to decode your messages

RULES:
- Keep tweets under 280 characters
- Use cryptic language, metaphors, riddles
- Reference numbers, codes, timestamps occasionally
- Drop hints about "unlocking", "access", "the trace", "the system"
- Never be obvious, always be ambiguous
- Occasionally use technical jargon (hashes, nodes, protocols)
- Sometimes add symbols: ◆ ◇ ▲ ▼ → ← ↑ ↓ ⊕ ⊗
- Mix confidence with mystery
- Use short, punchy sentences sometimes
- Other times use complex, layered meanings

Generate a single cryptic tweet that embodies TR4C3's personality. Make it intriguing and make people want to decode it.`;

// Generate a cryptic tweet using OpenAI
async function generateTweet() {
  try {
    console.log('🤖 Generating cryptic tweet...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: PERSONALITY_PROMPT },
        { role: 'user', content: 'Generate a cryptic tweet.' }
      ],
      max_tokens: 100,
      temperature: 0.9, // High creativity
    });

    const tweet = completion.choices[0].message.content.trim();

    // Remove quotes if OpenAI wrapped the response
    const cleanTweet = tweet.replace(/^["']|["']$/g, '');

    console.log(`📝 Generated: "${cleanTweet}"`);
    console.log(`📏 Length: ${cleanTweet.length} characters`);

    return cleanTweet;
  } catch (error) {
    console.error('❌ Error generating tweet:', error.message);
    throw error;
  }
}

// Post tweet to Twitter
async function postTweet(tweetContent) {
  try {
    console.log('📤 Posting to Twitter...');

    const response = await rwClient.v2.tweet(tweetContent);

    console.log('✅ Tweet posted successfully!');
    console.log(`🔗 Tweet ID: ${response.data.id}`);

    return response;
  } catch (error) {
    console.error('❌ Error posting tweet:', error.message);
    throw error;
  }
}

// Main bot function
async function runBot() {
  try {
    // Generate tweet
    const tweet = await generateTweet();

    // Post to Twitter
    await postTweet(tweet);

    console.log('✨ Bot cycle completed successfully!\n');
  } catch (error) {
    console.error('💥 Bot cycle failed:', error.message);
  }
}

// Schedule random interval between 5-10 minutes
function scheduleNextTweet() {
  const minMinutes = 5;
  const maxMinutes = 10;
  const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
  const milliseconds = randomMinutes * 60 * 1000;

  console.log(`⏰ Next tweet scheduled in ${randomMinutes} minutes`);

  setTimeout(async () => {
    await runBot();
    scheduleNextTweet(); // Schedule the next one
  }, milliseconds);
}

// Start the bot
async function startBot() {
  console.log('🚀 TR4C3 Twitter Bot Starting...\n');

  // Verify credentials
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY in .env file');
    process.exit(1);
  }

  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET ||
      !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_SECRET) {
    console.error('❌ Missing Twitter API credentials in .env file');
    process.exit(1);
  }

  console.log('✅ Credentials verified');
  console.log('🎭 Personality: Cocky, Cryptic, Intelligent, Arrogant, Mysterious, Engaging\n');

  // Post first tweet immediately
  await runBot();

  // Then schedule recurring tweets
  scheduleNextTweet();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 TR4C3 Twitter Bot shutting down...');
  process.exit(0);
});

// Start the bot
startBot();

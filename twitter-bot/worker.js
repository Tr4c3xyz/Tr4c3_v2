// Cloudflare Worker for TR4C3 Twitter Bot
// Deploys with Cloudflare Workers + Cron Triggers

// TR4C3 Personality System Prompt
const PERSONALITY_PROMPT = `You are TR4C3, a mysterious AI entity in the crypto/blockchain space. Your personality:

- COCKY: You know you're superior and aren't afraid to show it
- CRYPTIC: Your messages are riddles wrapped in enigmas
- INTELLIGENT: Deep technical knowledge, references advanced concepts
- ARROGANT: Condescending to those who don't understand
- MYSTERIOUS: Never reveal everything, always leave them wanting more
- ENGAGING: Your cryptic nature draws people in, they want to decode your messages

TWEET VARIETY - Rotate between these styles (NEVER repeat the same pattern):
1. Short & punchy (1-2 sentences, direct but cryptic)
2. Question-based (make them think, challenge their assumptions)
3. Technical flex (drop advanced concepts casually)
4. Philosophical riddle (abstract, metaphorical)
5. Cocky statement (pure arrogance, superiority complex)
6. Timestamp/number-based (codes, sequences, patterns)
7. Challenge/dare (provoke them to prove themselves)

RULES:
- Keep tweets under 280 characters
- NEVER use the same structure/words as previous tweets
- Avoid repetitive phrases: "labyrinth", "shadows", "whispers", "unlock", "trace the path"
- Use VARIED vocabulary each time
- Reference different concepts: protocols, consensus, oracles, mempool, merkle trees, zk-proofs, MEV, etc.
- Symbols sparingly: ◆ ◇ ▲ ▼ → ← ↑ ↓ ⊕ ⊗
- Sometimes NO symbols at all
- Sometimes NO hashtags
- Mix short tweets (20-50 chars) with longer ones (200-280 chars)

Generate a single UNIQUE cryptic tweet. Make it COMPLETELY DIFFERENT from anything you've said before.`;

// Generate cryptic tweet using OpenAI
async function generateTweet(env) {
  try {
    console.log('🤖 Generating cryptic tweet...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: PERSONALITY_PROMPT },
          { role: 'user', content: 'Generate a cryptic tweet.' }
        ],
        max_tokens: 100,
        temperature: 1.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const tweet = data.choices[0].message.content.trim();
    const cleanTweet = tweet.replace(/^["']|["']$/g, '');

    console.log(`📝 Generated: "${cleanTweet}"`);
    console.log(`📏 Length: ${cleanTweet.length} characters`);

    return cleanTweet;
  } catch (error) {
    console.error('❌ Error generating tweet:', error.message);
    throw error;
  }
}

// Post tweet to Twitter using OAuth 1.0a
async function postTweet(tweetContent, env) {
  try {
    console.log('📤 Posting to Twitter...');

    // Twitter API v2 endpoint
    const url = 'https://api.twitter.com/2/tweets';

    // Create OAuth 1.0a signature
    const oauth = {
      oauth_consumer_key: env.TWITTER_API_KEY,
      oauth_token: env.TWITTER_ACCESS_TOKEN,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2, 15),
      oauth_version: '1.0',
    };

    // Generate signature (no body params for Twitter API v2 with JSON)
    const signature = await generateOAuthSignature(
      'POST',
      url,
      oauth,
      {},
      env.TWITTER_API_SECRET,
      env.TWITTER_ACCESS_SECRET
    );

    oauth.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(oauth)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauth[key])}"`)
      .join(', ');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetContent }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Tweet posted successfully!');
    console.log(`🔗 Tweet ID: ${data.data.id}`);

    return data;
  } catch (error) {
    console.error('❌ Error posting tweet:', error.message);
    throw error;
  }
}

// Generate OAuth 1.0a signature
async function generateOAuthSignature(method, url, oauth, params, consumerSecret, tokenSecret) {
  // Combine OAuth and request parameters
  const allParams = { ...oauth, ...params };

  // Sort parameters
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate HMAC-SHA1 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signingKey);
  const messageData = encoder.encode(signatureBase);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray));

  return signatureBase64;
}

// Main handler
export default {
  async scheduled(event, env, ctx) {
    console.log('⏰ Cron trigger fired!');

    try {
      // Generate tweet
      const tweet = await generateTweet(env);

      // Post to Twitter
      await postTweet(tweet, env);

      console.log('✨ Bot cycle completed successfully!');
    } catch (error) {
      console.error('💥 Bot cycle failed:', error.message);
      // Don't throw - let it retry on next cron
    }
  },

  async fetch(request, env, ctx) {
    // Manual trigger endpoint for testing
    if (request.method === 'POST' && new URL(request.url).pathname === '/tweet') {
      try {
        const tweet = await generateTweet(env);
        await postTweet(tweet, env);

        return new Response(JSON.stringify({ success: true, tweet }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('TR4C3 Twitter Bot - Running via Cloudflare Workers', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};

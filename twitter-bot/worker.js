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

// Fetch mentions from Twitter
async function getMentions(env, sinceId = null) {
  try {
    console.log('🔍 Fetching mentions...');

    // Get user ID first
    const userUrl = 'https://api.twitter.com/2/users/me';
    const userOauth = {
      oauth_consumer_key: env.TWITTER_API_KEY,
      oauth_token: env.TWITTER_ACCESS_TOKEN,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2, 15),
      oauth_version: '1.0',
    };

    const userSignature = await generateOAuthSignature('GET', userUrl, userOauth, {}, env.TWITTER_API_SECRET, env.TWITTER_ACCESS_SECRET);
    userOauth.oauth_signature = userSignature;

    const userAuthHeader = 'OAuth ' + Object.keys(userOauth)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(userOauth[key])}"`)
      .join(', ');

    const userResponse = await fetch(userUrl, {
      headers: { 'Authorization': userAuthHeader },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user ID: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Fetch mentions
    let mentionsUrl = `https://api.twitter.com/2/users/${userId}/mentions?max_results=10&tweet.fields=conversation_id,in_reply_to_user_id`;
    if (sinceId) {
      mentionsUrl += `&since_id=${sinceId}`;
    }

    const mentionsOauth = {
      oauth_consumer_key: env.TWITTER_API_KEY,
      oauth_token: env.TWITTER_ACCESS_TOKEN,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2, 15),
      oauth_version: '1.0',
    };

    const mentionsSignature = await generateOAuthSignature('GET', mentionsUrl.split('?')[0], mentionsOauth, {}, env.TWITTER_API_SECRET, env.TWITTER_ACCESS_SECRET);
    mentionsOauth.oauth_signature = mentionsSignature;

    const mentionsAuthHeader = 'OAuth ' + Object.keys(mentionsOauth)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(mentionsOauth[key])}"`)
      .join(', ');

    const mentionsResponse = await fetch(mentionsUrl, {
      headers: { 'Authorization': mentionsAuthHeader },
    });

    if (!mentionsResponse.ok) {
      throw new Error(`Failed to fetch mentions: ${mentionsResponse.status}`);
    }

    const mentionsData = await mentionsResponse.json();
    console.log(`📬 Found ${mentionsData.meta?.result_count || 0} mentions`);

    return mentionsData.data || [];
  } catch (error) {
    console.error('❌ Error fetching mentions:', error.message);
    return [];
  }
}

// Generate reply to a tweet
async function generateReply(env, mentionText) {
  try {
    console.log('🤖 Generating cryptic reply...');

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
          { role: 'user', content: `Someone tweeted at you: "${mentionText}"\n\nGenerate a cryptic, condescending reply that stays in character. Keep it under 280 characters. Make them feel like they're not worthy of a straight answer.` }
        ],
        max_tokens: 100,
        temperature: 1.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();
    const cleanReply = reply.replace(/^[\"']|[\"']$/g, '');

    console.log(`📝 Generated reply: "${cleanReply}"`);
    return cleanReply;
  } catch (error) {
    console.error('❌ Error generating reply:', error.message);
    throw error;
  }
}

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
async function postTweet(tweetContent, env, replyToTweetId = null) {
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

    // Build tweet body with optional reply
    const tweetBody = { text: tweetContent };
    if (replyToTweetId) {
      tweetBody.reply = { in_reply_to_tweet_id: replyToTweetId };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetBody),
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
      // Generate and post main tweet
      const tweet = await generateTweet(env);
      await postTweet(tweet, env);

      // Check for mentions and reply to them
      const mentions = await getMentions(env);

      if (mentions.length > 0) {
        console.log(`💬 Replying to ${mentions.length} mentions...`);

        for (const mention of mentions.slice(0, 3)) { // Reply to max 3 mentions per cycle
          try {
            const reply = await generateReply(env, mention.text);
            await postTweet(reply, env, mention.id);
            console.log(`✅ Replied to tweet ${mention.id}`);

            // Wait 2 seconds between replies to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (replyError) {
            console.error(`❌ Failed to reply to ${mention.id}:`, replyError.message);
          }
        }
      }

      console.log('✨ Bot cycle completed successfully!');
    } catch (error) {
      console.error('💥 Bot cycle failed:', error.message);
      // Don't throw - let it retry on next cron
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Manual trigger endpoint for testing
    if (request.method === 'POST' && url.pathname === '/tweet') {
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

    // Auto-trigger first tweet on any GET request (for deployment initialization)
    if (request.method === 'GET' && url.pathname === '/init') {
      try {
        console.log('🚀 Initialization tweet triggered');
        const tweet = await generateTweet(env);
        await postTweet(tweet, env);

        return new Response(JSON.stringify({ success: true, message: 'Initial tweet posted', tweet }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('TR4C3 Twitter Bot - Running via Cloudflare Workers\n\nEndpoints:\nPOST /tweet - Manual tweet\nGET /init - Initialize with first tweet', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};

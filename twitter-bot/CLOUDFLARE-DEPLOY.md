# Deploy TR4C3 Twitter Bot to Cloudflare Workers 🚀

## Why Cloudflare Workers?
✅ **Same platform** as your Cloudflare Pages site
✅ **Secrets management** built-in
✅ **Free tier** - 100,000 requests/day
✅ **Cron triggers** - automated scheduling
✅ **No server management** - completely serverless
✅ **Fast global deployment**

## Quick Deploy (5 minutes)

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```
This will open your browser to authenticate.

### Step 3: Add Your Secrets
Run these commands to add your API keys as secrets:

```bash
cd twitter-bot

# Add OpenAI API Key
wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

# Add Twitter API credentials
wrangler secret put TWITTER_API_KEY
wrangler secret put TWITTER_API_SECRET
wrangler secret put TWITTER_ACCESS_TOKEN
wrangler secret put TWITTER_ACCESS_SECRET
```

**OR** add secrets via Cloudflare Dashboard:
1. Go to https://dash.cloudflare.com
2. Workers & Pages → Overview
3. After first deploy: Click your worker → Settings → Variables
4. Add each secret under "Environment Variables"

### Step 4: Deploy!
```bash
npm run deploy
```

That's it! Your bot is now running on Cloudflare Workers! 🎉

## How It Works

### Cron Triggers
The bot runs automatically every 5, 7, and 9 minutes using cron triggers.
This creates random intervals between tweets (5-10 minutes).

Configure in `wrangler.toml`:
```toml
[triggers]
crons = [
  "*/5 * * * *",  # Every 5 minutes
  "*/7 * * * *",  # Every 7 minutes
  "*/9 * * * *"   # Every 9 minutes
]
```

### Manual Trigger (Testing)
You can manually trigger a tweet:
```bash
# Get your worker URL from dashboard
curl -X POST https://tr4c3-twitter-bot.YOUR-SUBDOMAIN.workers.dev/tweet
```

## View Logs
```bash
wrangler tail
```
This shows real-time logs of your worker.

## Update the Bot
1. Make changes to `worker.js`
2. Run `npm run deploy`
3. Changes are live instantly!

## Secrets Management

### View secrets (doesn't show values):
```bash
wrangler secret list
```

### Update a secret:
```bash
wrangler secret put OPENAI_API_KEY
```

### Delete a secret:
```bash
wrangler secret delete OPENAI_API_KEY
```

## Cost

**Cloudflare Workers Free Tier:**
- ✅ 100,000 requests/day
- ✅ Unlimited cron triggers
- ✅ No credit card required

Your bot uses ~200-300 requests/day, so **completely free**!

**OpenAI Costs:**
- GPT-4: ~$0.01-0.03 per tweet
- Daily: ~$2-9 (200-300 tweets)
- Monthly: ~$60-270

💡 **Tip:** Use `gpt-3.5-turbo` instead of `gpt-4-turbo-preview` in `worker.js` to reduce costs to ~$5/month.

## Troubleshooting

### Error: "Worker not found"
Run `wrangler deploy` first to create the worker.

### Error: "Secret not found"
Make sure you added all 5 secrets via `wrangler secret put`.

### Error: "Twitter 403 Forbidden"
- Check Twitter app has **Read and Write** permissions
- Regenerate access tokens after changing permissions

### Error: "OpenAI 401 Unauthorized"
- Verify your OpenAI API key is correct
- Check you have billing enabled at https://platform.openai.com/account/billing

### Tweets not posting
Check logs: `wrangler tail` to see errors

## Monitoring

### Cloudflare Dashboard:
1. Go to https://dash.cloudflare.com
2. Workers & Pages → tr4c3-twitter-bot
3. View metrics, logs, and cron trigger history

### Analytics:
- Requests per day
- Errors
- CPU time
- Cron trigger success rate

## Customization

### Change tweet frequency:
Edit `wrangler.toml` cron schedules.

### Change personality:
Edit `PERSONALITY_PROMPT` in `worker.js`.

### Change AI model:
Replace `gpt-4-turbo-preview` with `gpt-3.5-turbo` in `worker.js`.

## Stop the Bot

### Temporarily disable:
```bash
wrangler delete
```

### Permanently remove:
1. Go to Cloudflare Dashboard
2. Workers & Pages → tr4c3-twitter-bot
3. Settings → Delete

---

**Next Steps:**
1. ✅ Deploy: `npm run deploy`
2. ✅ Add secrets via CLI or dashboard
3. ✅ Watch logs: `wrangler tail`
4. ✅ Monitor in Cloudflare dashboard

Your TR4C3 bot is now tweeting cryptic messages 24/7! 🤖

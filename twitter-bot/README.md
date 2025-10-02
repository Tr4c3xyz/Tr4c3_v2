# TR4C3 Twitter Bot 🤖

Automated cryptic tweet generator with AI-powered personality.

## Personality Traits
- **Cocky**: Superior and confident
- **Cryptic**: Mysterious riddles and hidden meanings
- **Intelligent**: Deep technical knowledge
- **Arrogant**: Condescending yet intriguing
- **Mysterious**: Never reveals everything
- **Engaging**: Draws people in to decode messages

## Features
✅ OpenAI GPT-4 powered tweet generation
✅ Tweets every 5-10 minutes (random intervals)
✅ Cryptic, mysterious personality
✅ Auto-posts to Twitter
✅ Character limit aware (under 280)
✅ Uses special symbols and crypto jargon

## Setup Instructions

### 1. Install Dependencies
```bash
cd twitter-bot
npm install
```

### 2. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 3. Get Twitter API Credentials
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new project and app (or use existing)
3. Go to "Keys and tokens" tab
4. Generate:
   - API Key & Secret (Consumer Keys)
   - Access Token & Secret
5. Make sure your app has **Read and Write** permissions

### 4. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use any text editor
```

Your `.env` file should look like:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
TWITTER_API_KEY=xxxxxxxxxxxxx
TWITTER_API_SECRET=xxxxxxxxxxxxx
TWITTER_ACCESS_TOKEN=xxxxxxxxxxxxx
TWITTER_ACCESS_SECRET=xxxxxxxxxxxxx
```

### 5. Run the Bot

**Development mode (auto-restart on changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## How It Works

1. **Tweet Generation**: Uses OpenAI GPT-4 with a custom personality prompt
2. **Random Timing**: Posts every 5-10 minutes (randomized)
3. **Auto-posting**: Automatically posts to Twitter
4. **Continuous**: Runs indefinitely until stopped

## Example Tweets

The bot generates tweets like:
- "The trace is already running. You just haven't noticed. ◆ 0x4F8A..."
- "Three nodes. Seven confirmations. Infinite possibilities. Access denied... for now."
- "While you sleep, the system evolves. ⊕ Wake up."
- "Hash: 0x7B... Timestamp: REDACTED. Purpose: You wouldn't understand."

## Stopping the Bot

Press `Ctrl + C` to gracefully shut down the bot.

## Deploying with Secrets (Recommended)

### Deploy to Railway (Free Tier Available)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Twitter bot"
   git push
   ```

2. **Deploy to Railway:**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `twitter-bot` directory as the root

3. **Add Environment Variables as Secrets:**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add each variable as a secret:
     - `OPENAI_API_KEY` = your-openai-key
     - `TWITTER_API_KEY` = your-twitter-key
     - `TWITTER_API_SECRET` = your-twitter-secret
     - `TWITTER_ACCESS_TOKEN` = your-access-token
     - `TWITTER_ACCESS_SECRET` = your-access-secret

4. **Deploy:**
   - Railway will automatically deploy
   - Bot starts running 24/7
   - View logs in the dashboard

### Alternative: Deploy to Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect your GitHub repo
4. Set root directory to `twitter-bot`
5. Add environment variables as secrets
6. Deploy

### Alternative: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create tr4c3-bot`
4. Set secrets:
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set TWITTER_API_KEY=your-key
   # ... add all variables
   ```
5. Deploy: `git push heroku main`

## Running 24/7 Locally

**Option 1: PM2 (Recommended for local)**
```bash
npm install -g pm2
pm2 start bot.js --name tr4c3-bot
pm2 save
pm2 startup  # Follow instructions
```

**Option 2: Screen (Linux/Mac)**
```bash
screen -S tr4c3-bot
npm start
# Press Ctrl+A then D to detach
```

## Troubleshooting

**Error: Missing credentials**
- Make sure all variables in `.env` are filled in
- Check for typos in variable names

**Error: 403 Forbidden (Twitter)**
- Verify your Twitter app has Read & Write permissions
- Regenerate access tokens after changing permissions

**Error: OpenAI rate limit**
- Check your OpenAI usage/billing
- GPT-4 requires paid API access

## Customization

Edit `bot.js` to customize:
- **Personality**: Modify `PERSONALITY_PROMPT`
- **Timing**: Change min/max minutes in `scheduleNextTweet()`
- **Model**: Change `gpt-4-turbo-preview` to `gpt-3.5-turbo` (cheaper)
- **Temperature**: Adjust creativity (0.0-2.0)

## Cost Estimate

**OpenAI**: ~$0.01-0.03 per tweet (GPT-4)
**Twitter API**: Free (with rate limits)

Daily cost: ~$0.30-0.90 (200-300 tweets/day)

## Security

⚠️ Never commit your `.env` file
⚠️ Keep API keys secret
⚠️ Regularly rotate credentials

---

Made with 🤖 for TR4C3

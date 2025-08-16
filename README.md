# NSW PWA Train Assistant

A Progressive Web App (PWA) for NSW train travel assistance, featuring natural language chat interface, real-time journey planning, and offline support.

![NSW Train Assistant](public/icons/icon-192.png)

## Features

- **🤖 AI-Powered Chat Interface**: Natural language understanding for journey queries
- **🚆 Real-time Journey Planning**: Live data from Transport for NSW API
- **📱 Progressive Web App**: Installable on mobile devices with offline support
- **🌐 Multi-Platform**: Telegram bot integration for messaging platform access
- **🎨 Modern Dark UI**: Beautiful glassmorphism design with shadcn/ui components
- **🔄 Sync UI**: Chat and manual picker stay in sync
- **📍 Station Autocomplete**: Quick station selection with mode toggle (Train/Metro/Bus/Ferry)
- **⚡ Quick Actions**: Swap stations, view map, set alerts with one tap

## Tech Stack

- **Frontend**: Next.js 15.4, TypeScript, Tailwind CSS, shadcn/ui
- **APIs**: OpenAI GPT-3.5, Transport for NSW Open Data
- **PWA**: next-pwa, Service Worker with offline caching
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+
- npm or yarn
- API Keys:
  - Perplexity API key OR OpenAI API key (for natural language understanding)
  - Transport for NSW API key
  - Telegram Bot Token (optional)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nsw-pwa-train-assistant.git
   cd nsw-pwa-train-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Perplexity API Key (recommended - more cost-effective)
   # Get yours at: https://www.perplexity.ai/settings/api
   PERPLEXITY_API_KEY=pplx-your-perplexity-api-key

   # OR OpenAI API Key (alternative)
   # Get yours at: https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-openai-api-key

   # Transport for NSW API Key (required)
   TFNSW_API_KEY=your-tfnsw-api-key

   # Telegram Bot Token (optional)
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token

   # Your app URL (for Telegram webhook)
   NEXT_PUBLIC_URL=https://your-app-url.vercel.app
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### Perplexity API Key (Recommended)
1. Visit [Perplexity AI Settings](https://www.perplexity.ai/settings/api)
2. Sign up or log in
3. Generate an API key
4. More cost-effective than OpenAI for this use case

### OpenAI API Key (Alternative)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key

### Transport for NSW API Key
1. Visit [TfNSW Open Data](https://opendata.transport.nsw.gov.au/)
2. Register for an account
3. Create a new application
4. Copy the API key

### Telegram Bot Setup (Optional)
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token
4. Set webhook URL: `https://your-app-url.vercel.app/api/telegram`

## PWA Installation

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Tap "Add"

## Usage Examples

### Chat Interface
- "Next train from Central to Parramatta"
- "How do I get to Circular Quay?"
- "Show me buses from Town Hall to Bondi Junction"
- "Ferry times to Manly"

### Manual Station Picker
1. Select transport mode (Train/Metro/Bus/Ferry)
2. Choose departure station
3. Choose arrival station
4. Click Search

### Quick Actions
- **Swap**: Reverse the journey direction
- **Map**: View route on map (coming soon)
- **Alert**: Set notifications for delays (coming soon)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── ChatWindow.tsx
│   │   ├── StationPicker.tsx
│   │   └── ...
│   ├── lib/              # Utilities
│   └── page.tsx          # Main page
├── pages/api/            # API routes
│   ├── intent.ts        # NLU processing
│   ├── journey.ts       # TfNSW integration
│   ├── fallback.ts      # Offline data
│   └── telegram.ts      # Telegram webhook
├── public/              # Static assets
│   ├── icons/          # PWA icons
│   ├── stations/       # Station data
│   └── manifest.json   # PWA manifest
└── next.config.mjs     # Next.js + PWA config
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
npm run build
npm start
```

## API Reference

### POST /api/intent
Extract journey intent from natural language
```json
{
  "text": "Next train from Central to Chatswood"
}
```

### POST /api/journey
Get journey information
```json
{
  "from": "Central",
  "to": "Chatswood",
  "mode": "train",
  "datetime": "2024-01-13T10:00:00Z"
}
```

### POST /api/telegram
Webhook endpoint for Telegram bot

## Offline Support

The app caches:
- App shell and static assets
- Last queried journey data
- Station list for autocomplete

Offline fallback provides:
- Basic schedule data
- Common route information
- Cached journey results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issues page.

---

Built with ❤️ for NSW commuters

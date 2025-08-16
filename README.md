# 🚂 TfNSW Real-time Journey Planner

A comprehensive real-time public transport journey planner for Sydney, NSW. Get live train schedules, platform information, and journey planning with actual TfNSW API data.

## ✨ Features

- 🔴 **Real-time Journey Planning** - Live TfNSW API integration
- 🚉 **Accurate Platform Numbers** - Shows actual platform assignments
- ⚡ **Fast Performance** - Optimized Next.js PWA
- 📱 **Mobile-First Design** - Responsive on all devices
- 🌟 **Beautiful UI** - Animated starfield background
- 🔍 **Station Search** - 200+ Sydney train stations
- ❤️ **Favorites** - Save frequently used routes
- 🔄 **Offline Support** - PWA with service worker

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thesumanshah/tfnsw-assistant)

### Required Environment Variables

1. **Get a TfNSW API Key**: 
   - Register at [TfNSW Open Data Hub](https://opendata.transport.nsw.gov.au/)
   - Create an application to get your API key

2. **Set Environment Variables in Vercel**:
   ```
   TFNSW_API_KEY=your_tfnsw_api_key_here
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Optional Variables**:
   ```
   OPENAI_API_KEY=your_openai_key_for_ai_features
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

## 🛠️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thesumanshah/tfnsw-assistant.git
   cd tfnsw-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser


## 🏗️ Architecture

```
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── StationPicker.tsx  # Station selection
│   │   └── ShootingStarsBackground.tsx # Animated background
│   ├── lib/               # Utility libraries
│   └── hooks/             # Custom React hooks
├── pages/api/             # API routes
│   ├── journey.ts         # Main journey planning
│   ├── intent.ts          # AI intent parsing
│   └── telegram.ts        # Telegram bot integration
├── public/               # Static assets
└── .github/workflows/    # GitHub Actions CI/CD
```

## 🚀 Deployment Options

### Vercel (Recommended)
- One-click deployment
- Automatic CI/CD
- Built-in analytics
- Global CDN

### Docker
```bash
docker build -t tfnsw-assistant .
docker run -p 3000:3000 -e TFNSW_API_KEY=your_key tfnsw-assistant
```

### Other Platforms
- **Railway**: `railway login && railway deploy`
- **Render**: Connect GitHub repo and deploy
- **Netlify**: Deploy from Git with build command `npm run build`


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/thesumanshah/tfnsw-assistant/issues)

## 🙏 Acknowledgments

- Transport for NSW for providing the open data API
- Next.js team for the amazing framework
- Vercel for hosting and deployment platform

---

**Made with ❤️ for Sydney commuters** 🚂
